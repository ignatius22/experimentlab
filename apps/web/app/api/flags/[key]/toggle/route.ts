import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@experiment/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { orgId } = await auth();
  const { key } = await params;
  const { enabled } = await req.json();

  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const flag = await prisma.featureFlag.findFirst({
    where: { key, organizationId: orgId }
  });

  if (!flag) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const updated = await prisma.featureFlag.update({
    where: { id: flag.id },
    data: { enabled }
  });

  return NextResponse.json(updated);
}
