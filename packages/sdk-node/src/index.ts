import { bucket, evaluateRules, type ExperimentManifest, type Rule } from "experimentlab-core";

export type { ExperimentManifest } from "experimentlab-core";

export interface Logger {
  warn(message: string, error?: unknown): void;
}

export interface ManifestSource {
  fetchManifest(): Promise<ExperimentManifest>;
  /**
   * Optional future push transport hook (for SSE or WebSockets). The polling
   * client remains compatible with sources that do not implement it.
   */
  subscribe?(
    onManifest: (manifest: ExperimentManifest) => void,
    onError: (error: unknown) => void,
  ): () => void;
}

export interface EventTransport {
  sendEvents(events: ServerEvent[]): Promise<void>;
}

export interface NodeExperimentClientOptions {
  /** A server API key created in ExperimentLab settings. Never expose it to browsers. */
  apiKey: string;
  /** Base URL of your ExperimentLab deployment, e.g. https://flags.example.com. */
  baseUrl: string;
  /** Poll interval for manifest changes. Defaults to 60 seconds. Set to 0 to disable polling. */
  refreshIntervalMs?: number;
  /** Start loading in the constructor. Defaults to true for eventual consistency without startup blocking. */
  autoStart?: boolean;
  /** Flush queued tracking events at this interval. Defaults to 5 seconds. */
  eventFlushIntervalMs?: number;
  /** Flush immediately once this number of events has accumulated. Defaults to 100. */
  eventBatchSize?: number;
  /** Bounds memory when the tracking endpoint is unavailable. Defaults to 10,000. */
  maxEventQueueSize?: number;
  logger?: Logger;
  /** Advanced: replace HTTP polling with a custom source, such as an SSE-backed source. */
  manifestSource?: ManifestSource;
  /** Advanced: replace HTTP event delivery. Useful for tests and custom network policies. */
  eventTransport?: EventTransport;
  fetch?: typeof fetch;
}

export interface ServerEvent {
  type: "track";
  userId: string;
  name: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface ManifestSnapshot {
  manifest: ExperimentManifest | null;
  loaded: boolean;
  lastUpdatedAt: Date | null;
}

const DEFAULT_REFRESH_INTERVAL_MS = 60_000;
const DEFAULT_EVENT_FLUSH_INTERVAL_MS = 5_000;
const DEFAULT_EVENT_BATCH_SIZE = 100;
const DEFAULT_MAX_EVENT_QUEUE_SIZE = 10_000;

class HttpManifestSource implements ManifestSource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch,
  ) {}

  async fetchManifest(): Promise<ExperimentManifest> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/client/manifest`, {
      headers: { "x-api-key": this.apiKey },
    });
    if (!response.ok) throw new Error(`Manifest request failed with HTTP ${response.status}`);
    return response.json() as Promise<ExperimentManifest>;
  }
}

class HttpEventTransport implements EventTransport {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch,
  ) {}

  async sendEvents(events: ServerEvent[]): Promise<void> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/client/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
      body: JSON.stringify(events),
    });
    if (!response.ok) throw new Error(`Event request failed with HTTP ${response.status}`);
  }
}

/**
 * A process-local server SDK. Each Node.js process keeps its own cache and
 * polling timer; no request performs a network call during flag evaluation.
 */
export class ExperimentNodeClient {
  private manifest: ExperimentManifest | null = null;
  private lastUpdatedAt: Date | null = null;
  private initialLoadStarted = false;
  private initialLoadPromise: Promise<boolean> | null = null;
  private refreshInFlight: Promise<boolean> | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private eventTimer: ReturnType<typeof setInterval> | null = null;
  private unsubscribe: (() => void) | null = null;
  private eventQueue: ServerEvent[] = [];
  private flushInFlight: Promise<void> | null = null;

  private readonly refreshIntervalMs: number;
  private readonly eventFlushIntervalMs: number;
  private readonly eventBatchSize: number;
  private readonly maxEventQueueSize: number;
  private readonly logger: Logger;
  private readonly manifestSource: ManifestSource;
  private readonly eventTransport: EventTransport;

  constructor(options: NodeExperimentClientOptions) {
    if (!options.apiKey.trim()) throw new Error("ExperimentLab server SDK requires apiKey");
    if (!options.baseUrl.trim()) throw new Error("ExperimentLab server SDK requires baseUrl");

    const baseUrl = options.baseUrl.replace(/\/+$/, "");
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl && (!options.manifestSource || !options.eventTransport)) {
      throw new Error("A Fetch implementation is required in this Node.js runtime");
    }

    this.refreshIntervalMs = options.refreshIntervalMs ?? DEFAULT_REFRESH_INTERVAL_MS;
    this.eventFlushIntervalMs = options.eventFlushIntervalMs ?? DEFAULT_EVENT_FLUSH_INTERVAL_MS;
    this.eventBatchSize = options.eventBatchSize ?? DEFAULT_EVENT_BATCH_SIZE;
    this.maxEventQueueSize = options.maxEventQueueSize ?? DEFAULT_MAX_EVENT_QUEUE_SIZE;
    this.logger = options.logger ?? console;
    this.manifestSource = options.manifestSource ?? new HttpManifestSource(baseUrl, options.apiKey, fetchImpl!);
    this.eventTransport = options.eventTransport ?? new HttpEventTransport(baseUrl, options.apiKey, fetchImpl!);

    if (options.autoStart !== false) this.start();
  }

  /** Starts polling without requiring callers to block application startup. */
  start(): void {
    if (this.initialLoadStarted) return;
    this.initialLoadStarted = true;
    this.initialLoadPromise = this.refresh();

    if (this.refreshIntervalMs > 0) {
      this.refreshTimer = setInterval(() => { void this.refresh(); }, this.refreshIntervalMs);
      this.refreshTimer.unref?.();
    }
    if (this.eventFlushIntervalMs > 0) {
      this.eventTimer = setInterval(() => { void this.flush(); }, this.eventFlushIntervalMs);
      this.eventTimer.unref?.();
    }
    if (this.manifestSource.subscribe) {
      this.unsubscribe = this.manifestSource.subscribe(
        (manifest) => this.applyManifest(manifest),
        (error) => this.log("ExperimentLab push manifest update failed; keeping cached manifest.", error),
      );
    }
  }

  /** Waits for the first manifest attempt. Resolves false rather than crashing when unavailable. */
  ready(): Promise<boolean> {
    this.start();
    return this.initialLoadPromise!;
  }

  /** Fetches a fresh manifest. Existing cached values remain usable if this fails. */
  refresh(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.manifestSource.fetchManifest()
      .then((manifest) => {
        this.applyManifest(manifest);
        return true;
      })
      .catch((error) => {
        this.log("ExperimentLab manifest refresh failed; keeping last-known-good values.", error);
        return false;
      })
      .finally(() => { this.refreshInFlight = null; });
    return this.refreshInFlight;
  }

  getFlag(userId: string, flagKey: string, defaultValue = false, context: Record<string, unknown> = {}): boolean {
    const flag = this.manifest?.flags.find((candidate) => candidate.key === flagKey);
    if (!flag || !flag.enabled) return defaultValue;
    if (!evaluateRules(flag.rules as Rule[] | undefined, context)) return defaultValue;
    return bucket(userId, flagKey) < (flag.rollout ?? 100);
  }

  getAllFlags(userId: string, context: Record<string, unknown> = {}): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    for (const flag of this.manifest?.flags ?? []) {
      flags[flag.key] = this.getFlag(userId, flag.key, false, context);
    }
    return flags;
  }

  track(userId: string, eventName: string, properties?: Record<string, unknown>): void {
    if (this.eventQueue.length >= this.maxEventQueueSize) {
      this.log("ExperimentLab event queue is full; dropping the newest tracking event.");
      return;
    }
    this.eventQueue.push({ type: "track", userId, name: eventName, payload: properties, timestamp: new Date().toISOString() });
    if (this.eventQueue.length >= this.eventBatchSize) void this.flush();
  }

  async flush(): Promise<void> {
    if (this.flushInFlight) return this.flushInFlight;
    if (this.eventQueue.length === 0) return;

    const batch = this.eventQueue.splice(0, this.eventQueue.length);
    this.flushInFlight = this.eventTransport.sendEvents(batch)
      .catch((error) => {
        // Preserve chronological order and never let tracking errors impact host requests.
        const available = Math.max(0, this.maxEventQueueSize - this.eventQueue.length);
        this.eventQueue.unshift(...batch.slice(0, available));
        this.log("ExperimentLab event flush failed; queued events will be retried.", error);
      })
      .finally(() => { this.flushInFlight = null; });
    return this.flushInFlight;
  }

  getSnapshot(): ManifestSnapshot {
    return { manifest: this.manifest, loaded: this.manifest !== null, lastUpdatedAt: this.lastUpdatedAt };
  }

  async close(): Promise<void> {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.eventTimer) clearInterval(this.eventTimer);
    this.refreshTimer = null;
    this.eventTimer = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
    await this.flush();
  }

  private applyManifest(manifest: ExperimentManifest): void {
    // One atomic assignment keeps request-time reads consistent in Node's event loop.
    this.manifest = manifest;
    this.lastUpdatedAt = new Date();
  }

  private log(message: string, error?: unknown): void {
    this.logger.warn(message, error);
  }
}

export function createExperimentNodeClient(options: NodeExperimentClientOptions): ExperimentNodeClient {
  return new ExperimentNodeClient(options);
}
