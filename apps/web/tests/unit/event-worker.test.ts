import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createMany: vi.fn(), batchFindMany: vi.fn(), batchUpdateMany: vi.fn(), transaction: vi.fn() }));
vi.mock("@experiment/db", () => ({ prisma: { $transaction: mocks.transaction, $disconnect: vi.fn() } }));

import { flushEventJobs } from "../../worker/event-worker";

describe("event worker", () => {
  beforeEach(() => vi.clearAllMocks());
  it("flushes buffered jobs exactly once", async () => {
    const tx = { event: { createMany: mocks.createMany }, eventIngestionBatch: { findMany: mocks.batchFindMany, updateMany: mocks.batchUpdateMany } };
    mocks.transaction.mockImplementation((callback) => callback(tx));
    mocks.batchFindMany.mockResolvedValue([
      { id: "b1", organizationId: "org", eventCount: 2 },
      { id: "b2", organizationId: "org", eventCount: 1 }
    ]);
    const jobs = [
      { batchId: "b1", organizationId: "org", events: [{ userId: "u1", type: "exposure", name: "test" }, { userId: "u2", type: "track", name: "signup" }] },
      { batchId: "b2", organizationId: "org", events: [{ userId: "u3", type: "track", name: "signup" }] }
    ];
    await flushEventJobs(jobs);
    expect(mocks.createMany.mock.calls[0][0].data).toHaveLength(3);
    expect(mocks.batchUpdateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "processed" }) }));
  });

  it("does nothing when a retried batch was already processed", async () => {
    const tx = { event: { createMany: mocks.createMany }, eventIngestionBatch: { findMany: vi.fn().mockResolvedValue([]), updateMany: mocks.batchUpdateMany } };
    mocks.transaction.mockImplementationOnce((callback) => callback(tx));
    await flushEventJobs([{ batchId: "done", organizationId: "org", events: [{ userId: "u", type: "track", name: "x" }] }]);
    expect(mocks.createMany).not.toHaveBeenCalled();
  });
});
