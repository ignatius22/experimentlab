import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";

function normalCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) p = 1 - p;
  return p;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const experiment = await prisma.experiment.findFirst({
    where: {
      id,
      organizationId: orgId
    }
  });

  if (!experiment) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  }

  // Fetch real exposures and conversion metrics for this experiment matching by event name = experiment.key
  const [exposures, conversions] = await Promise.all([
    prisma.event.groupBy({
      by: ["variantId"],
      where: {
        organizationId: orgId,
        name: experiment.key,
        type: "exposure"
      },
      _count: { id: true }
    }),
    prisma.event.groupBy({
      by: ["variantId"],
      where: {
        organizationId: orgId,
        name: experiment.key,
        type: "track"
      },
      _count: { id: true }
    })
  ]);

  const exposuresMap = new Map<string, number>();
  exposures.forEach(e => {
    if (e.variantId) exposuresMap.set(e.variantId, e._count.id);
  });

  const conversionsMap = new Map<string, number>();
  conversions.forEach(c => {
    if (c.variantId) conversionsMap.set(c.variantId, c._count.id);
  });

  const variantsList = Array.isArray(experiment.variants) ? (experiment.variants as any[]) : [];
  
  // Calculate statistical conversion rate & uplift vs control
  const controlVariant = variantsList.find(v => v.id === "control") || variantsList[0];
  const controlExposures = controlVariant ? (exposuresMap.get(controlVariant.id) || 0) : 0;
  const controlConversions = controlVariant ? (conversionsMap.get(controlVariant.id) || 0) : 0;
  const controlRate = controlExposures > 0 ? controlConversions / controlExposures : 0;

  const metrics = variantsList.map(v => {
    const expCount = exposuresMap.get(v.id) || 0;
    const convCount = conversionsMap.get(v.id) || 0;
    const rate = expCount > 0 ? convCount / expCount : 0;
    const uplift = controlRate > 0 ? (rate - controlRate) / controlRate : 0;
    
    // Z-Score calculation
    const pooledP = (controlConversions + convCount) / Math.max(controlExposures + expCount, 1);
    const se = Math.sqrt(Math.max(pooledP * (1 - pooledP) * (1 / Math.max(controlExposures, 1) + 1 / Math.max(expCount, 1)), 0.00001));
    const zScore = se > 0 ? (rate - controlRate) / se : 0;
    const pValue = Math.min(Math.max(2 * (1 - normalCdf(Math.abs(zScore))), 0.0001), 1.0);

    return {
      variantId: v.id,
      variantName: v.name || v.id,
      weight: v.weight || 50,
      exposures: expCount,
      conversions: convCount,
      conversionRate: rate,
      upliftVsControl: uplift,
      standardError: se,
      zScore: Number(zScore.toFixed(3)),
      pValue: Number(pValue.toFixed(4)),
      isSignificant: pValue < 0.05,
      isWinner: experiment.winningVariantId === v.id
    };
  });

  return NextResponse.json({
    experiment,
    metrics
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updated = await prisma.experiment.updateMany({
    where: {
      id,
      organizationId: orgId
    },
    data: {
      status: body.status,
      rules: body.rules !== undefined ? body.rules : undefined,
      rollout: body.rollout !== undefined ? Number(body.rollout) : undefined
    }
  });

  return NextResponse.json({ success: true, updated });
}
