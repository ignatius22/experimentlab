import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

  // Sync org
  await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: { id: orgId, name: "New Org" }
  });

  const flag = await prisma.featureFlag.create({
    data: {
      key,
      name: key,
      description: description || "",
      enabled: false,
      organizationId: orgId,
      rules: []
    }
  });

  return NextResponse.json(flag);
}
