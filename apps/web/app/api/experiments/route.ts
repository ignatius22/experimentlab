import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";
import { CreateExperimentInputSchema } from "@experiment/schemas";

export async function GET() {
  const { orgId } = await auth();

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized: No active organization" }, { status: 401 });
  }

  const experiments = await prisma.experiment.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(experiments);
}

export async function POST(req: Request) {
  const { orgId } = await auth();

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized: No active organization" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateExperimentInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await prisma.organization.upsert({ where: { id: orgId }, update: {}, create: { id: orgId, name: "Auto-synced Organization" } });
    const experiment = await prisma.experiment.create({ data: {
        key: parsed.data.key,
        name: parsed.data.name,
        status: "draft",
        variants: [
          { id: "control", name: "Control", weight: 50 },
          { id: "variant", name: "Variant", weight: 50 }
        ],
        metrics: parsed.data.metrics,
        rollout: 100,
        rules: (parsed.data.rules as any) || [],
        organizationId: orgId
    }});

    return NextResponse.json(experiment, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "An experiment with this key already exists in your organization" }, { status: 400 });
    }
    throw error;
  }
}
