export type AnalyticsEvent = {
  id: string;
  type: "track" | "identify" | "page" | "exposure";
  timestamp: string;
  payload: Record<string, unknown>;
};

const listeners = new Set<() => void>();
let events: AnalyticsEvent[] = [];
let queue: AnalyticsEvent[] = [];
let rafId: number | null = null;

function flushQueue() {
  rafId = null;
  if (queue.length === 0) return;
  events = [...queue.reverse(), ...events].slice(0, 50000);
  queue = [];
  listeners.forEach((listener) => listener());
}

function scheduleFlush() {
  if (rafId !== null || typeof window === "undefined") {
    return;
  }
  rafId = window.requestAnimationFrame(flushQueue);
}

function emit(type: AnalyticsEvent["type"], payload: Record<string, unknown>) {
  queue.push({ id: crypto.randomUUID(), type, timestamp: new Date().toISOString(), payload });
  scheduleFlush();
}

export function setEvents(newEvents: AnalyticsEvent[]) {
  events = newEvents;
  listeners.forEach((listener) => listener());
}

export function track(name: string, payload: Record<string, unknown> = {}) {
  emit("track", { name, ...payload });
}

export function identify(userId: string, traits: Record<string, unknown> = {}) {
  emit("identify", { userId, ...traits });
}

export function page(path: string) {
  emit("page", { path });
}

export function exposure(experimentKey: string, variant: string) {
  emit("exposure", { experimentKey, variant });
}

export function subscribeEvents(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getEvents() {
  return events;
}
