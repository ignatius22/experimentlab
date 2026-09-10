import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@experiment/db";
import { EVENT_QUEUE_NAME, redisUrl, type EventBatchJob } from "../lib/event-queue";
import { markBatchFailed } from "../lib/event-ingestion";

export async function flushEventJobs(jobs: EventBatchJob[]) {
  if (!jobs.length) return;
  await prisma.$transaction(async (tx) => {
    const batches = await tx.eventIngestionBatch.findMany({ where: { id: { in: jobs.map((job) => job.batchId) }, status: "reserved" } });
    const activeIds = new Set(batches.map((batch) => batch.id));
    const activeJobs = jobs.filter((job) => activeIds.has(job.batchId));
    if (!activeJobs.length) return;

    await tx.event.createMany({ data: activeJobs.flatMap((job) => job.events.map((event) => ({ organizationId: job.organizationId, userId: event.userId || "anonymous", type: event.type, name: event.name, variantId: event.variantId || null, payload: (event.payload || {}) as any, createdAt: event.timestamp ? new Date(event.timestamp) : new Date() }))) });

    await tx.eventIngestionBatch.updateMany({ where: { id: { in: [...activeIds] } }, data: { status: "processed", processedAt: new Date() } });
  });
}

export function createBufferedProcessor(options: { maxEvents?: number; flushMs?: number } = {}) {
  const maxEvents = options.maxEvents || Number(process.env.EVENT_WORKER_BATCH_SIZE || 500);
  const flushMs = options.flushMs || Number(process.env.EVENT_WORKER_FLUSH_MS || 250);
  let pending: Array<{ job: Job<EventBatchJob>; resolve: () => void; reject: (error: unknown) => void }> = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    if (timer) clearTimeout(timer);
    timer = null;
    const current = pending;
    pending = [];
    try {
      await flushEventJobs(current.map((item) => item.job.data));
      current.forEach((item) => item.resolve());
    } catch (error) {
      current.forEach((item) => item.reject(error));
    }
  };

  return (job: Job<EventBatchJob>) => new Promise<void>((resolve, reject) => {
    pending.push({ job, resolve, reject });
    const eventCount = pending.reduce((total, item) => total + item.job.data.events.length, 0);
    if (eventCount >= maxEvents) void flush();
    else if (!timer) timer = setTimeout(() => void flush(), flushMs);
  });
}

export function startEventWorker() {
  const connection = new IORedis(redisUrl(), { maxRetriesPerRequest: null });
  const worker = new Worker<EventBatchJob>(EVENT_QUEUE_NAME, createBufferedProcessor(), { connection, concurrency: Number(process.env.EVENT_WORKER_CONCURRENCY || 20) });
  worker.on("failed", async (job) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 1)) await markBatchFailed(job.data.batchId).catch(console.error);
  });
  return worker;
}
