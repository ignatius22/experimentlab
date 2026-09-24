import { afterEach, describe, expect, it, vi } from "vitest";
import { bucket, type ExperimentManifest } from "experimentlab-core";
import { ExperimentNodeClient, type EventTransport, type ManifestSource } from "../index";

const manifest: ExperimentManifest = {
  flags: [
    { key: "new_checkout", enabled: true, rollout: 50, rules: [] },
    { key: "team_only", enabled: true, rollout: 100, rules: [{ attribute: "plan", operator: "eq", value: "team" }] },
  ],
  experiments: [],
};

const clients: ExperimentNodeClient[] = [];

function clientWith(source: ManifestSource, eventTransport?: EventTransport) {
  const client = new ExperimentNodeClient({
    apiKey: "exp_live_server_test",
    baseUrl: "https://flags.test",
    manifestSource: source,
    eventTransport: eventTransport ?? { sendEvents: vi.fn().mockResolvedValue(undefined) },
    refreshIntervalMs: 0,
    eventFlushIntervalMs: 0,
  });
  clients.push(client);
  return client;
}

afterEach(async () => { await Promise.all(clients.splice(0).map((client) => client.close())); });

describe("ExperimentNodeClient", () => {
  it("uses sdk-core bucketing so server and client evaluations stay deterministic", async () => {
    const client = clientWith({ fetchManifest: vi.fn().mockResolvedValue(manifest) });
    await expect(client.ready()).resolves.toBe(true);

    const userId = "user_42";
    expect(client.getFlag(userId, "new_checkout", false)).toBe(bucket(userId, "new_checkout") < 50);
    expect(client.getFlag(userId, "team_only", false, { plan: "team" })).toBe(true);
    expect(client.getFlag(userId, "team_only", true, { plan: "community" })).toBe(true);
    expect(client.getAllFlags(userId, { plan: "team" })).toEqual({
      new_checkout: bucket(userId, "new_checkout") < 50,
      team_only: true,
    });
  });

  it("keeps last-known-good flags when a refresh fails", async () => {
    const source = { fetchManifest: vi.fn().mockResolvedValueOnce(manifest).mockRejectedValueOnce(new Error("offline")) };
    const logger = { warn: vi.fn() };
    const client = new ExperimentNodeClient({
      apiKey: "exp_live_server_test", baseUrl: "https://flags.test", manifestSource: source,
      eventTransport: { sendEvents: vi.fn().mockResolvedValue(undefined) }, refreshIntervalMs: 0, eventFlushIntervalMs: 0, logger,
    });
    clients.push(client);
    await client.ready();
    const before = client.getFlag("user_1", "new_checkout", false);

    await expect(client.refresh()).resolves.toBe(false);
    expect(client.getFlag("user_1", "new_checkout", false)).toBe(before);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("last-known-good"), expect.any(Error));
  });

  it("returns the default value when the initial manifest attempt fails", async () => {
    const logger = { warn: vi.fn() };
    const client = new ExperimentNodeClient({
      apiKey: "exp_live_server_test", baseUrl: "https://flags.test",
      manifestSource: { fetchManifest: vi.fn().mockRejectedValue(new Error("offline")) },
      eventTransport: { sendEvents: vi.fn().mockResolvedValue(undefined) }, refreshIntervalMs: 0, eventFlushIntervalMs: 0, logger,
    });
    clients.push(client);

    await expect(client.ready()).resolves.toBe(false);
    expect(client.getFlag("user_1", "missing", true)).toBe(true);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("deduplicates concurrent initial reads and exposes ready without blocking construction", async () => {
    let resolveManifest: (value: ExperimentManifest) => void = () => undefined;
    const fetchManifest = vi.fn(() => new Promise<ExperimentManifest>((resolve) => { resolveManifest = resolve; }));
    const client = clientWith({ fetchManifest });

    const first = client.ready();
    const second = client.ready();
    expect(fetchManifest).toHaveBeenCalledTimes(1);
    expect(client.getFlag("user_1", "new_checkout", false)).toBe(false);

    resolveManifest(manifest);
    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(client.getSnapshot().loaded).toBe(true);
  });

  it("batches server tracking events and retries failed delivery without throwing", async () => {
    const sendEvents = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    const logger = { warn: vi.fn() };
    const client = new ExperimentNodeClient({
      apiKey: "exp_live_server_test", baseUrl: "https://flags.test", manifestSource: { fetchManifest: vi.fn().mockResolvedValue(manifest) },
      eventTransport: { sendEvents }, eventBatchSize: 2, eventFlushIntervalMs: 0, refreshIntervalMs: 0, logger,
    });
    clients.push(client);

    client.track("user_1", "signup", { source: "api" });
    client.track("user_2", "signup");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await client.flush();

    expect(sendEvents).toHaveBeenCalledTimes(2);
    expect(sendEvents.mock.calls[0][0]).toHaveLength(2);
    expect(sendEvents.mock.calls[1][0]).toHaveLength(2);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("event flush failed"), expect.any(Error));
  });

  it("evaluates live and completed experiment variants on the server", async () => {
    const experimentManifest: ExperimentManifest = {
      flags: [],
      experiments: [
        {
          key: "search_ranking",
          status: "running",
          rollout: 100,
          variants: [
            { id: "control", name: "Control", weight: 50 },
            { id: "ai_ranked", name: "AI Ranked", weight: 50 }
          ]
        },
        {
          key: "completed_promo",
          status: "completed",
          rollout: 100,
          winningVariantId: "ai_promo",
          variants: [
            { id: "control", name: "Control", weight: 50 },
            { id: "ai_promo", name: "AI Promo", weight: 50 }
          ]
        }
      ]
    };

    const client = clientWith({ fetchManifest: vi.fn().mockResolvedValue(experimentManifest) });
    await client.ready();

    const variant = client.getExperimentVariant("user_99", "search_ranking");
    expect(variant).not.toBeNull();
    expect(["control", "ai_ranked"]).toContain(variant?.id);
    expect(client.getExperimentVariantKey("user_99", "search_ranking")).toBe(variant?.name);

    // Completed experiment always yields winning variant
    const winningVariant = client.getExperimentVariant("user_any", "completed_promo");
    expect(winningVariant?.id).toBe("ai_promo");
    expect(client.getExperimentVariantKey("user_any", "completed_promo")).toBe("AI Promo");
  });
});
