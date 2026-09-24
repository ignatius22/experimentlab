import { describe, expect, it } from "vitest";
import { calculateZTest } from "../../lib/stats";

describe("Frequentist Z-Test statistics", () => {
  it("correctly identifies statistically significant positive uplift", () => {
    // Control: 1000 exposures, 100 conversions (10% rate)
    // Treatment: 1000 exposures, 160 conversions (16% rate)
    const result = calculateZTest(1000, 100, 1000, 160);

    expect(result.uplift).toBeCloseTo(0.60, 2);
    expect(result.pValue).toBeLessThan(0.01);
    expect(result.pValue).toBeGreaterThan(0);
    expect(result.isSignificant).toBe(true);
  });

  it("correctly identifies statistically significant negative drop", () => {
    // Control: 1000 exposures, 160 conversions (16% rate)
    // Treatment: 1000 exposures, 100 conversions (10% rate)
    const result = calculateZTest(1000, 160, 1000, 100);

    expect(result.uplift).toBeCloseTo(-0.375, 2);
    expect(result.pValue).toBeLessThan(0.01);
    expect(result.pValue).toBeGreaterThan(0);
    expect(result.isSignificant).toBe(true);
  });

  it("returns high p-value and non-significant for identical conversion rates", () => {
    const result = calculateZTest(1000, 100, 1000, 100);

    expect(result.uplift).toBe(0);
    expect(result.pValue).toBeGreaterThan(0.9);
    expect(result.pValue).toBeLessThanOrEqual(1.0);
    expect(result.isSignificant).toBe(false);
  });

  it("never outputs a p-value exceeding 1.0", () => {
    for (let treatConv = 50; treatConv <= 150; treatConv += 10) {
      const result = calculateZTest(1000, 100, 1000, treatConv);
      expect(result.pValue).toBeLessThanOrEqual(1.0);
      expect(result.pValue).toBeGreaterThanOrEqual(0.0001);
    }
  });
});
