import { prisma } from "@experiment/db";
import { randomUUID } from "crypto";
import { getEventQueue, type IngestEvent } from "./event-queue";

/**
 * Persisting the batch before queueing makes worker retries idempotent. This is
 * deliberately independent of pricing or usage limits so every self-hosted
 * installation benefits from reliable ingestion under a traffic spike.
 */
export async function enqueueEventBatch(organizationId: string, events: IngestEvent[]) {
  const batchId = randomUUID();
  await prisma.eventIngestionBatch.create({ data: { id: batchId, organizationId, eventCount: events.length } });

  try {
    await getEventQueue().add("event-batch", { batchId, organizationId, events }, { jobId: batchId });
  } catch (error) {
    await markBatchFailed(batchId);
    throw error;
  }
  return batchId;
}

export async function markBatchFailed(batchId: string) {
  await prisma.eventIngestionBatch.updateMany({
    where: { id: batchId, status: "reserved" },
    data: { status: "failed", processedAt: new Date() }
  });
}
