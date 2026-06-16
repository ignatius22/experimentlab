import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@experiment/db";

export async function GET(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 100), 1000);
  const type = searchParams.get("type");

  const events = await prisma.event.findMany({
    where: {
      organizationId: orgId,
      ...(type ? { type } : {})
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return NextResponse.json(events);
}
