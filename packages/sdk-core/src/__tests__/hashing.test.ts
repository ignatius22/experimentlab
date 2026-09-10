import { describe, it, expect } from "vitest";
import { stableHash, bucket, evaluateRules } from "../index";

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

  it("evaluates targeting rules correctly", () => {
    const rules = [
      { attribute: "plan", operator: "eq" as const, value: "pro" },
      { attribute: "country", operator: "in" as const, value: ["US", "CA"] }
    ];

    expect(evaluateRules(rules, { plan: "pro", country: "US" })).toBe(true);
    expect(evaluateRules(rules, { plan: "free", country: "US" })).toBe(false);
    expect(evaluateRules(rules, { plan: "pro", country: "UK" })).toBe(false);
  });
});
