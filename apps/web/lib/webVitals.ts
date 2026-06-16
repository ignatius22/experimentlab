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
  
  // Track vital as a real event for persistence
  track(`vital_${metric.toLowerCase()}`, { value: Number(value.toFixed(3)) });
  
  listeners.forEach((listener) => listener());
}

export function initWebVitals() {
  if (initialized || typeof window === "undefined") {
    return;
  }
  initialized = true;
  onCLS((metric) => update("CLS", metric.value));
  onINP((metric) => update("INP", metric.value));
  onLCP((metric) => update("LCP", metric.value));
}

export function subscribeVitals(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVitals() {
  return vitals;
}
