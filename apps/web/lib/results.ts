import { prisma } from "@experiment/db";
import { calculateZTest, type StatsResult } from "./stats";
import type { Experiment, Variant } from "@experiment/schemas";
import { Prisma } from "@prisma/client";

type VariantAggregate = { variantId: string | null; exposures: bigint; conversions: bigint };

export async function getExperimentResults(experimentId: string, organizationId?: string) {
  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      ...(organizationId ? { organizationId } : {})
    }
  });

  if (!experiment) throw new Error("Experiment not found");

  const variants = experiment.variants as unknown as Variant[];
  const primaryMetric = (experiment.metrics && experiment.metrics.length > 0) ? experiment.metrics[0] : "conversion";

  const aggregates = await prisma.$queryRaw<VariantAggregate[]>(Prisma.sql`
    WITH exposed_users AS (
      SELECT "variantId", "userId", MIN("createdAt") AS first_exposed_at
      FROM "Event"
      WHERE "organizationId" = ${experiment.organizationId}
        AND type = 'exposure' AND name = ${experiment.key}
        AND "variantId" IS NOT NULL
      GROUP BY "variantId", "userId"
    ), exposure_counts AS (
      SELECT "variantId", COUNT(DISTINCT "userId")::bigint AS exposures
      FROM exposed_users
      GROUP BY "variantId"
    ), conversion_counts AS (
      SELECT eu."variantId", COUNT(DISTINCT c."userId")::bigint AS conversions
      FROM exposed_users eu
      INNER JOIN "Event" c ON c."organizationId" = ${experiment.organizationId}
        AND c."userId" = eu."userId"
        AND (c.type = 'track' OR c.type = 'conversion')
        AND (c.name = ${primaryMetric} OR c.name = ${experiment.key})
        AND c."createdAt" >= eu.first_exposed_at
      GROUP BY eu."variantId"
    )
    SELECT ec."variantId", ec.exposures, COALESCE(cc.conversions, 0)::bigint AS conversions
    FROM exposure_counts ec LEFT JOIN conversion_counts cc ON cc."variantId" = ec."variantId"
  `);

  // 2. Fetch conversions per variant
  // For each variant, we want users who were exposed to that variant AND triggered the primary metric
  const variantResults: Record<string, StatsResult> = {};

  for (const variant of variants) {
    const aggregate = aggregates.find((row) => row.variantId === variant.id);
    const exposureCount = Number(aggregate?.exposures || 0);
    const conversionCount = Number(aggregate?.conversions || 0);

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
