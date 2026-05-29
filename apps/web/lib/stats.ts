/**
 * Frequentist Z-test for two proportions.
 * Compares a treatment variant against a control variant.
 */

export interface StatsResult {
  exposures: number;
  conversions: number;
  rate: number;
  uplift: number | null;
  pValue: number | null;
  isSignificant: boolean;
}

/**
 * Calculates the p-value for a given Z-score (two-tailed).
 */
function zToP(z: number): number {
  // Approximation of the error function
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 2 * (z > 0 ? 1 - p : p);
}

export function calculateZTest(
  controlExposures: number,
  controlConversions: number,
  treatmentExposures: number,
  treatmentConversions: number
): { uplift: number; pValue: number; isSignificant: boolean } {
  if (controlExposures === 0 || treatmentExposures === 0) {
    return { uplift: 0, pValue: 1, isSignificant: false };
  }

  const p1 = controlConversions / controlExposures;
  const p2 = treatmentConversions / treatmentExposures;

  if (p1 === 0) return { uplift: 0, pValue: 1, isSignificant: false };

  const uplift = (p2 - p1) / p1;

  // Pooled proportion
  const p = (controlConversions + treatmentConversions) / (controlExposures + treatmentExposures);
  
  if (p === 0 || p === 1) return { uplift, pValue: 1, isSignificant: false };

  // Standard error
  const se = Math.sqrt(p * (1 - p) * (1 / controlExposures + 1 / treatmentExposures));
  
  const z = (p2 - p1) / se;
  const pValue = zToP(z);

  return {
    uplift,
    pValue,
    isSignificant: pValue < 0.05
  };
}
