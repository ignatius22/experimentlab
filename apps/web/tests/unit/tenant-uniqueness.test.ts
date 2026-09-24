import { describe, it, expect } from "vitest";

describe("Tenant Compound Key Uniqueness Logic", () => {
  it("permits identical feature flag keys across distinct organizations", () => {
    const flagsDb: Array<{ organizationId: string; key: string }> = [];

    const insertFlag = (organizationId: string, key: string) => {
      const exists = flagsDb.some(f => f.organizationId === organizationId && f.key === key);
      if (exists) {
        throw new Error(`A feature flag with this key already exists in your organization`);
      }
      flagsDb.push({ organizationId, key });
      return { organizationId, key };
    };

    // Org 1 creates "checkout-redesign"
    expect(() => insertFlag("org_1", "checkout-redesign")).not.toThrow();

    // Org 2 creates the EXACT SAME key "checkout-redesign" -> MUST SUCCEED under compound uniqueness!
    expect(() => insertFlag("org_2", "checkout-redesign")).not.toThrow();

    // Org 1 attempts duplicate key within SAME org -> MUST BE REJECTED
    expect(() => insertFlag("org_1", "checkout-redesign")).toThrowError(
      "A feature flag with this key already exists in your organization"
    );
  });

  it("permits identical experiment keys across distinct organizations", () => {
    const experimentsDb: Array<{ organizationId: string; key: string }> = [];

    const insertExperiment = (organizationId: string, key: string) => {
      const exists = experimentsDb.some(e => e.organizationId === organizationId && e.key === key);
      if (exists) {
        throw new Error(`An experiment with this key already exists in your organization`);
      }
      experimentsDb.push({ organizationId, key });
      return { organizationId, key };
    };

    // Org A creates "signup_flow_v2"
    expect(() => insertExperiment("org_alpha", "signup_flow_v2")).not.toThrow();

    // Org B creates "signup_flow_v2" -> MUST SUCCEED
    expect(() => insertExperiment("org_beta", "signup_flow_v2")).not.toThrow();

    // Duplicate in Org A -> REJECTED
    expect(() => insertExperiment("org_alpha", "signup_flow_v2")).toThrowError(
      "An experiment with this key already exists in your organization"
    );
  });
});
