import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { orgId } = await auth();
  const { key } = await params;
  const { enabled } = await req.json();

  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const updated = await prisma.featureFlag.update({
      where: {
        organizationId_key: {
          organizationId: orgId,
          key
        }
      },
      data: { enabled }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "NotFound" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to toggle flag" }, { status: 500 });
  }
}
