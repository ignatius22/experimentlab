import type { Experiment, FeatureFlag, Variant, Rule } from "@experiment/schemas";

export function stableHash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

export function bucket(userId: string, key: string): number {
  return stableHash(`${userId}:${key}`) % 100;
}

export function evaluateRules(rules: Rule[] | null | undefined, context: Record<string, any>): boolean {
  if (!rules || rules.length === 0) return true;

  return rules.every((rule) => {
    const attrValue = context[rule.attribute];
    if (attrValue === undefined) return false;

    switch (rule.operator) {
      case "eq":
        return attrValue === rule.value;
      case "neq":
        return attrValue !== rule.value;
      case "contains":
        return String(attrValue).includes(String(rule.value));
      case "in":
        return Array.isArray(rule.value) && rule.value.includes(attrValue);
      case "nin":
        return Array.isArray(rule.value) && !rule.value.includes(attrValue);
      default:
        return false;
    }
  });
}

export interface ExperimentManifest {
  flags: Array<{
    key: string;
    enabled: boolean;
    rollout?: number;
    rules?: Rule[];
  }>;
  experiments: Array<{
    key: string;
    variants: Variant[];
    rollout: number;
    status: string;
    metrics?: string[];
    winningVariantId?: string | null;
    rules?: Rule[];
  }>;
}

export type Listener = () => void;

export const EMPTY_STATE: { manifest: ExperimentManifest | null; loading: boolean } = { manifest: null, loading: false };

export interface Event {
  type: "exposure" | "track";
  userId: string;
  name: string;
  variantId?: string;
  payload?: Record<string, any>;
  timestamp: string;
}

export class ExperimentClient {
  private publishableKey: string;
  private userId: string;
  private baseUrl: string;
  private context: Record<string, any>;
  private manifest: ExperimentManifest | null = null;
  private listeners: Set<Listener> = new Set();
  private loading = false;
  private state = EMPTY_STATE;
  private eventQueue: Event[] = [];
  private seenExposures: Set<string> = new Set();
  private flushTimer: any = null;
  private assignments: Record<string, string> = {};
  private STORAGE_KEY = "exp_assignments";
  private onEvent?: (event: Event) => void;

  constructor(options: { 
    publishableKey: string; 
    userId: string; 
    baseUrl?: string; 
    context?: Record<string, any>;
    onEvent?: (event: Event) => void;
  }) {
    this.publishableKey = options.publishableKey;
    this.userId = options.userId;
    this.baseUrl = options.baseUrl || "";
    this.context = options.context || {};
    this.onEvent = options.onEvent;

    if (typeof window !== "undefined") {
      this.loadAssignments();
      window.addEventListener("visibilitychange", () => {
        if (window.document.visibilityState === "hidden") {
          this.flush();
        }
      });
    }
  }

  private loadAssignments() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) this.assignments = JSON.parse(raw);
    } catch (e) {
      console.error("[Experiment SDK] Failed to load assignments", e);
    }
  }

  private saveAssignments() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.assignments));
    } catch (e) {
      console.error("[Experiment SDK] Failed to save assignments", e);
    }
  }

  setContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context };
    this.notify();
  }

  async init() {
    if (this.loading) return;
    this.loading = true;
    this.updateState();
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/client/manifest?apiKey=${this.publishableKey}`);
      if (!res.ok) throw new Error("Failed to fetch manifest");
      this.manifest = await res.json();
    } catch (err) {
      console.error("[Experiment SDK] Initialization failed", err);
    } finally {
      this.loading = false;
      this.updateState();
      this.notify();
    }
  }

  private updateState() {
    this.state = {
      manifest: this.manifest,
      loading: this.loading
    };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getFlag(key: string): boolean {
    if (!this.manifest) return false;
    const flag = this.manifest.flags.find((f) => f.key === key);
    if (!flag || !flag.enabled) return false;
    
    // Evaluate Targeting Rules
    if (!evaluateRules(flag.rules, this.context)) return false;

    const rollout = flag.rollout ?? 100;
    return bucket(this.userId, key) < rollout;
  }

  getExperimentVariant(key: string): Variant | null {
    if (!this.manifest) return null;
    const experiment = this.manifest.experiments.find((e) => e.key === key);
    if (!experiment) return null;

    // 1. Check Sticky Assignments
    if (this.assignments[key]) {
      const existing = experiment.variants.find((v) => v.id === this.assignments[key]);
      if (existing) {
        this.trackExposure(key, existing.id);
        return existing;
      }
    }

    // 2. Handle Completed Experiments (Winner Promoted)
    if (experiment.status === "completed" && experiment.winningVariantId) {
      const winner = experiment.variants.find(v => v.id === experiment.winningVariantId) ?? null;
      if (winner) {
        this.assignments[key] = winner.id;
        this.saveAssignments();
      }
      return winner;
    }

    if (experiment.status !== "active") return null;

    // Evaluate Targeting Rules
    if (!evaluateRules(experiment.rules, this.context)) return null;

    const value = bucket(this.userId, key);
    if (value >= experiment.rollout) return null;

    let cursor = 0;
    const selected = experiment.variants.find((variant) => {
      cursor += variant.weight;
      return value < cursor;
    }) ?? experiment.variants[0];

    // 3. Persist Assignment
    this.assignments[key] = selected.id;
    this.saveAssignments();

    // Track exposure
    this.trackExposure(key, selected.id);

    return selected;
  }

  track(name: string, payload?: Record<string, any>) {
    this.enqueue({
      type: "track",
      userId: this.userId,
      name,
      payload,
      timestamp: new Date().toISOString()
    });
  }

  private trackExposure(experimentKey: string, variantId: string) {
    if (this.seenExposures.has(experimentKey)) return;
    this.seenExposures.add(experimentKey);

    this.enqueue({
      type: "exposure",
      userId: this.userId,
      name: experimentKey,
      variantId,
      timestamp: new Date().toISOString()
    });
  }

  private enqueue(event: Event) {
    this.eventQueue.push(event);

    if (this.onEvent) {
      this.onEvent(event);
    }

    if (this.eventQueue.length >= 10) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 5000);
    }
  }

  async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(`${this.baseUrl}/api/v1/client/events?apiKey=${this.publishableKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events)
      });
    } catch (err) {
      console.error("[Experiment SDK] Failed to flush events", err);
    }
  }

  getSnapshot() {
    return this.state;
  }
}
