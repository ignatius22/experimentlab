import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";
import { getExperimentResults } from "@/lib/results";
import { z } from "zod";
import { RuleSchema } from "@experiment/schemas";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let experimentData;
  try {
    experimentData = await getExperimentResults(id, orgId);
  } catch (err: any) {
    if (err?.message === "Experiment not found") {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }
    throw err;
  }

  const { experiment, results } = experimentData;
  const variantsList = Array.isArray(experiment.variants) ? (experiment.variants as any[]) : [];

  const metrics = variantsList.map(v => {
    const stats = results[v.id] || { exposures: 0, conversions: 0, rate: 0, uplift: 0, pValue: 1, isSignificant: false };
    return {
      variantId: v.id,
      variantName: v.name || v.id,
      weight: v.weight || 50,
      exposures: stats.exposures,
      conversions: stats.conversions,
      conversionRate: stats.rate,
      upliftVsControl: stats.uplift ?? 0,
      pValue: Number((stats.pValue ?? 1).toFixed(4)),
      isSignificant: stats.isSignificant,
      isWinner: experiment.winningVariantId === v.id
    };
  });

  return NextResponse.json({
    experiment,
    metrics
  });
}
const PatchExperimentSchema = z.object({
  status: z.enum(["draft", "running", "active", "paused", "completed"]).optional(),
  rules: z.array(RuleSchema).optional(),
  rollout: z.number().int().min(0).max(100).optional()
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await req.json().catch(() => ({}));
  const parsed = PatchExperimentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
  }

  const updated = await prisma.experiment.updateMany({
    where: {
      id,
      organizationId: orgId
    },
    data: {
      status: parsed.data.status,
      rules: parsed.data.rules !== undefined ? (parsed.data.rules as any) : undefined,
      rollout: parsed.data.rollout !== undefined ? parsed.data.rollout : undefined
    }
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "NotFound" }, { status: 404 });
  }

  return NextResponse.json({ success: true, updated });
}
