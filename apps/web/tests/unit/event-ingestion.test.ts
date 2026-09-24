import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  updateMany: vi.fn(),
  add: vi.fn(),
}));

vi.mock("@experiment/db", () => ({
  prisma: { eventIngestionBatch: { create: mocks.create, updateMany: mocks.updateMany } },
}));

vi.mock("../../lib/event-queue", () => ({
  getEventQueue: () => ({ add: mocks.add }),
}));

import { enqueueEventBatch } from "../../lib/event-ingestion";

describe("queued event ingestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue({});
    mocks.add.mockResolvedValue({});
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T14:20:00.000Z"));
  });

  it("records the UTC billing month before queueing an event batch", async () => {
    await enqueueEventBatch("org_1", [{ type: "track", userId: "user_1", name: "checkout", timestamp: "2026-09-15T14:20:00.000Z" }]);

    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organizationId: "org_1",
        eventCount: 1,
        billingPeriod: new Date("2026-09-01T00:00:00.000Z"),
      }),
    }));
    expect(mocks.add).toHaveBeenCalledWith("event-batch", expect.objectContaining({ organizationId: "org_1" }), expect.any(Object));
  });
});
