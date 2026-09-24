import { describe, it, expect } from "vitest";
import { ExperimentClient, stableHash, bucket, evaluateRules } from "../index";

describe("FNV-1a Hashing and Bucketing", () => {
  it("computes deterministic hash values", () => {
    const hash1 = stableHash("usr_123:exp_promo");
    const hash2 = stableHash("usr_123:exp_promo");
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe("number");
  });

  it("produces buckets strictly between 0 and 99", () => {
    for (let i = 0; i < 100; i++) {
      const b = bucket(`usr_${i}`, "checkout-v2");
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(100);
    }
  });

  it("evaluates targeting rules correctly including numeric comparisons", () => {
    const rules = [
      { attribute: "plan", operator: "eq" as const, value: "pro" },
      { attribute: "country", operator: "in" as const, value: ["US", "CA"] },
      { attribute: "age", operator: "gte" as const, value: 18 },
      { attribute: "version", operator: "lt" as const, value: 5 }
    ];

    expect(evaluateRules(rules, { plan: "pro", country: "US", age: 20, version: 3 })).toBe(true);
    expect(evaluateRules(rules, { plan: "pro", country: "US", age: 17, version: 3 })).toBe(false);
    expect(evaluateRules(rules, { plan: "pro", country: "US", age: 18, version: 5 })).toBe(false);
    expect(evaluateRules(rules, { plan: "free", country: "US", age: 20, version: 3 })).toBe(false);
    expect(evaluateRules(rules, { plan: "pro", country: "UK", age: 20, version: 3 })).toBe(false);
  });

  it("supports initialManifest for instant SSR evaluation without network roundtrip", () => {
    const client = new ExperimentClient({
      userId: "usr_ssr",
      initialManifest: {
        flags: [{ key: "new_ui", enabled: true }],
        experiments: []
      }
    });

    expect(client.getSnapshot().loading).toBe(false);
    expect(client.getFlag("new_ui")).toBe(true);
  });

  it("evaluates running experiments as live experiments", () => {
    const client = new ExperimentClient({ userId: "usr_123" });
    (client as any).manifest = {
      flags: [],
      experiments: [{
        key: "pricing_layout",
        status: "running",
        rollout: 100,
        variants: [{ id: "control", name: "Control", weight: 100 }]
      }]
    };

    expect(client.getExperimentVariant("pricing_layout")?.id).toBe("control");
  });

  it("distributes variants evenly without SRM even under partial rollout", () => {
    // 50/50 experiment with a 20% rollout
    const manifest = {
      flags: [],
      experiments: [{
        key: "test_rollout_srm",
        status: "running",
        rollout: 20,
        variants: [
          { id: "control", name: "Control", weight: 50 },
          { id: "treatment", name: "Treatment", weight: 50 }
        ]
      }]
    };

    let inRolloutCount = 0;
    let controlCount = 0;
    let treatmentCount = 0;

    for (let i = 0; i < 1000; i++) {
      const client = new ExperimentClient({ userId: `user_${i}` });
      (client as any).manifest = manifest;
      const variant = client.getExperimentVariant("test_rollout_srm");
      if (variant) {
        inRolloutCount++;
        if (variant.id === "control") controlCount++;
        if (variant.id === "treatment") treatmentCount++;
      }
    }

    // Rollout is 20%, so around 200 users (+- 50) should be included out of 1000
    expect(inRolloutCount).toBeGreaterThan(150);
    expect(inRolloutCount).toBeLessThan(250);

    // Both variants MUST receive substantial traffic (not 100% control)
    expect(controlCount).toBeGreaterThan(50);
    expect(treatmentCount).toBeGreaterThan(50);

    // Ratio should be close to 50/50 within binomial variance
    const ratio = controlCount / inRolloutCount;
    expect(ratio).toBeGreaterThan(0.35);
    expect(ratio).toBeLessThan(0.65);
  });
});
