import { onCLS, onINP, onLCP } from "web-vitals";
import { track } from "./analytics";

type VitalsState = {
  CLS: number | null;
  INP: number | null;
  LCP: number | null;
};

let vitals: VitalsState = { CLS: null, INP: null, LCP: null };
const listeners = new Set<() => void>();
let initialized = false;

function update(metric: keyof VitalsState, value: number) {
  vitals = { ...vitals, [metric]: Number(value.toFixed(3)) };
  
  // Track in local event store
  track(`vital_${metric.toLowerCase()}`, { value: Number(value.toFixed(3)) });

  // Post directly to the API endpoint for persistence
  fetch("/api/v1/client/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{
      type: "track",
      name: `vital_${metric.toLowerCase()}`,
      payload: { value: Number(value.toFixed(3)) },
      timestamp: new Date().toISOString()
    }])
  }).catch(() => {});
  
  listeners.forEach((listener) => listener());
}

export function initWebVitals() {
  if (initialized || typeof window === "undefined") {
    return;
  }
  initialized = true;

  try {
    onCLS((metric) => update("CLS", metric.value));
    onINP((metric) => update("INP", metric.value));
    onLCP((metric) => update("LCP", metric.value));

  } catch (e) {
    console.error("[WebVitals] Failed to attach listeners", e);
  }
}

export function subscribeVitals(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVitals() {
  return vitals;
}
