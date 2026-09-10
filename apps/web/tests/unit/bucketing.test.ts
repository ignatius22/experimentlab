import { bucket, stableHash } from "../../lib/bucketing";

describe("bucketing", () => {
  it("stableHash is deterministic", () => {
    expect(stableHash("abc")).toBe(stableHash("abc"));
  });

  it("bucket returns value between 0 and 99", () => {
    const value = bucket("user-1", "homepage_headline");
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(100);
  });
});
