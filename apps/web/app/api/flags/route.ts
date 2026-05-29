import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@experiment/db";

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
  const { key, name, description, enabled } = await req.json();

  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Sync org
  await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: { id: orgId, name: "New Org" }
  });

  const flag = await prisma.featureFlag.create({
    data: {
      key,
      name: name || key,
      description,
      enabled: enabled || false,
      organizationId: orgId,
      rules: []
    }
  });

  return NextResponse.json(flag);
}
