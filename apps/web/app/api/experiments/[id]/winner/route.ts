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

  const updated = await prisma.experiment.updateMany({
    where: {
      id,
      organizationId: orgId
    },
    data: {
      winningVariantId,
      status: "completed"
    }
  });

  return NextResponse.json({ success: true, updated });
}
