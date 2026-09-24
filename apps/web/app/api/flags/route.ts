import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";
import { CreateFeatureFlagInputSchema } from "@experiment/schemas";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const flags = await prisma.featureFlag.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(flags);
}

export async function POST(req: Request) {
  const { orgId } = await auth();
  const body = await req.json();
  const parsed = CreateFeatureFlagInputSchema.safeParse(body);

  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { key, description } = parsed.data;

  try {
    await prisma.organization.upsert({ where: { id: orgId }, update: {}, create: { id: orgId, name: "New Org" } });
    const flag = await prisma.featureFlag.create({
      data: { key, name: key, description: description || "", enabled: false, organizationId: orgId, rules: [] }
    });

    return NextResponse.json(flag);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A feature flag with this key already exists in your organization" }, { status: 400 });
    }
    throw error;
  }
}
