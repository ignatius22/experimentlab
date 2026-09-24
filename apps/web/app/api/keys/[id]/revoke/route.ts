import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const result = await prisma.apiKey.updateMany({
    where: {
      id,
      organizationId: orgId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "API key not found or already revoked" }, { status: 404 });
  }

  return NextResponse.json({ success: true, revokedId: id });
}
