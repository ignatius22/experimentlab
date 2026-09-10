import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), queryRaw: vi.fn() }));
vi.mock("@experiment/db", () => ({ prisma: { experiment: { findUnique: mocks.findUnique }, $queryRaw: mocks.queryRaw } }));

import { formatTrendRows } from "../../lib/trends";
import { getExperimentResults } from "../../lib/results";

describe("database-native aggregations", () => {
  it("formats grouped daily SQL rows identically to raw-event counters", () => {
    const now = new Date("2026-09-08T12:00:00Z");
    const rows = [{ bucket: new Date("2026-09-07T00:00:00Z"), evaluations: 2n, conversions: 1n }];
    const result = formatTrendRows(rows, "daily", now);
    expect(result.map((row) => [row.evaluations, row.conversions])).toEqual([[0,0],[0,0],[0,0],[0,0],[0,0],[2,1],[0,0]]);
  });

  it("builds experiment results from a SQL join without loading user IDs", async () => {
    mocks.findUnique.mockResolvedValue({ id: "exp", key: "checkout", organizationId: "org", metrics: ["signup"], variants: [{ id: "control", name: "Control", weight: 50 }, { id: "variant", name: "Variant", weight: 50 }] });
    mocks.queryRaw.mockResolvedValue([{ variantId: "control", exposures: 100n, conversions: 20n }, { variantId: "variant", exposures: 100n, conversions: 25n }]);
    const output = await getExperimentResults("exp");
    expect(output.results.control).toMatchObject({ exposures: 100, conversions: 20, rate: 0.2 });
    expect(output.results.variant).toMatchObject({ exposures: 100, conversions: 25, rate: 0.25 });
    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
  });
});
