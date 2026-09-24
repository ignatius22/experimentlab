import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { winningVariantId } = body;

  const experiment = await prisma.experiment.findUnique({ where: { id } });
  if (!experiment || experiment.organizationId !== orgId) {
    return NextResponse.json({ error: "NotFound" }, { status: 404 });
  }

  const variants = Array.isArray(experiment.variants) ? (experiment.variants as any[]) : [];
  const variantExists = variants.some((v) => v.id === winningVariantId);
  if (!variantExists) {
    return NextResponse.json({ error: "InvalidVariantId: Variant does not exist in this experiment" }, { status: 400 });
  }

  const updated = await prisma.experiment.update({
    where: { id },
    data: {
      winningVariantId,
      status: "completed"
    }
  });

  return NextResponse.json({ success: true, experiment: updated });
}
