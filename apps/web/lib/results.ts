import { prisma } from "@experiment/db";
import { calculateZTest, type StatsResult } from "./stats";
import type { Experiment, Variant } from "@experiment/schemas";

export async function getExperimentResults(experimentId: string) {
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId }
  });

  if (!experiment) throw new Error("Experiment not found");

  const variants = experiment.variants as unknown as Variant[];
  const primaryMetric = experiment.metrics[0] || "conversion";

  // 1. Fetch total exposures per variant
  const exposures = await prisma.event.groupBy({
    by: ["variantId"],
    where: {
      type: "exposure",
      name: experiment.key,
      organizationId: experiment.organizationId
    },
    _count: {
      userId: true
    }
  });

  // 2. Fetch conversions per variant
  // For each variant, we want users who were exposed to that variant AND triggered the primary metric
  const variantResults: Record<string, StatsResult> = {};

  for (const variant of variants) {
    const exposureCount = exposures.find(e => e.variantId === variant.id)?._count.userId || 0;

    // Subquery: Users exposed to this variant
    const exposedUserIds = await prisma.event.findMany({
      where: {
        type: "exposure",
        name: experiment.key,
        variantId: variant.id,
        organizationId: experiment.organizationId
      },
      select: { userId: true },
      distinct: ["userId"]
    });

    const userIds = exposedUserIds.map(u => u.userId);

    // Count how many of these users converted
    const conversionCount = await prisma.event.count({
      where: {
        type: "track",
        name: primaryMetric,
        userId: { in: userIds },
        organizationId: experiment.organizationId
      }
    });

    variantResults[variant.id] = {
      exposures: exposureCount,
      conversions: conversionCount,
      rate: exposureCount > 0 ? conversionCount / exposureCount : 0,
      uplift: null,
      pValue: null,
      isSignificant: false
    };
  }

  // 3. Compare treatments to control (first variant is control)
  const controlId = variants[0].id;
  const controlStats = variantResults[controlId];

  for (const variant of variants) {
    if (variant.id === controlId) continue;

    const stats = variantResults[variant.id];
    const { uplift, pValue, isSignificant } = calculateZTest(
      controlStats.exposures,
      controlStats.conversions,
      stats.exposures,
      stats.conversions
    );

    stats.uplift = uplift;
    stats.pValue = pValue;
    stats.isSignificant = isSignificant;
  }

  return {
    experiment,
    primaryMetric,
    results: variantResults
  };
}
