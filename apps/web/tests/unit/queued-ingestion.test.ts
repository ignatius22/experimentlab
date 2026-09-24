import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ enqueueEventBatch: vi.fn(), auth: vi.fn(), validateApiKey: vi.fn() }));
vi.mock("../../lib/event-ingestion", () => ({ enqueueEventBatch: mocks.enqueueEventBatch }));
vi.mock("../../lib/auth/server", () => ({ auth: mocks.auth }));
vi.mock("../../lib/keys", () => ({ validateApiKey: mocks.validateApiKey }));

import { POST } from "../../app/api/v1/client/events/route";

describe("queued event ingestion", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.validateApiKey.mockResolvedValue({ organizationId: "org_1" }); mocks.enqueueEventBatch.mockResolvedValue("batch_1"); });

  it("accepts a burst without performing synchronous event inserts", async () => {
    const events = Array.from({ length: 1000 }, (_, index) => ({ userId: `user_${index}`, type: "track", name: "signup_rate" }));
    const started = performance.now();
    const response = await POST(new Request("http://localhost/api/v1/client/events?apiKey=exp_live_test", { method: "POST", body: JSON.stringify(events) }));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ accepted: true, batchId: "batch_1" });
    expect(mocks.enqueueEventBatch).toHaveBeenCalledWith("org_1", events);
    expect(performance.now() - started).toBeLessThan(500);
  });

  it("rejects batches larger than the queue contract", async () => {
    const events = Array.from({ length: 1001 }, () => ({ userId: "user", type: "track", name: "metric" }));
    const response = await POST(new Request("http://localhost/api/v1/client/events?apiKey=exp_live_test", { method: "POST", body: JSON.stringify(events) }));
    expect(response.status).toBe(413);
    expect(mocks.enqueueEventBatch).not.toHaveBeenCalled();
  });
});
