import { Queue } from "bullmq";
import IORedis from "ioredis";

export const EVENT_QUEUE_NAME = "experimentlab-events";

export type IngestEvent = {
  userId: string;
  type: string;
  name: string;
  variantId?: string | null;
  payload?: Record<string, unknown>;
  timestamp?: string;
};

export type EventBatchJob = {
  batchId: string;
  organizationId: string;
  events: IngestEvent[];
};

declare global {
  var experimentEventQueue: Queue<EventBatchJob> | undefined;
  var experimentQueueRedis: IORedis | undefined;
}

export function redisUrl() {
  const value = process.env.REDIS_URL;
  if (!value && process.env.NODE_ENV === "production") throw new Error("FATAL: REDIS_URL is required in production");
  return value || "redis://localhost:6379";
}

export function getEventQueue() {
  if (!globalThis.experimentQueueRedis) {
    globalThis.experimentQueueRedis = new IORedis(redisUrl(), { maxRetriesPerRequest: 1, enableOfflineQueue: false });
    globalThis.experimentQueueRedis.on("error", () => {});
  }
  if (!globalThis.experimentEventQueue) {
    globalThis.experimentEventQueue = new Queue<EventBatchJob>(EVENT_QUEUE_NAME, {
      connection: globalThis.experimentQueueRedis,
      defaultJobOptions: { attempts: 5, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 1000, removeOnFail: 5000 }
    });
  }
  return globalThis.experimentEventQueue;
}
