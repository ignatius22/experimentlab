import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@experiment/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;
  const { status } = await req.json();

  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const experiment = await prisma.experiment.findUnique({ where: { id } });
  if (!experiment || experiment.organizationId !== orgId) {
    return NextResponse.json({ error: "NotFound" }, { status: 404 });
  }

  const updated = await prisma.experiment.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json(updated);
}
