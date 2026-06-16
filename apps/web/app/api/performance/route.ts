import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@experiment/db";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch last 1000 vital events to calculate averages
  const events = await prisma.event.findMany({
    where: {
      organizationId: orgId,
      name: { startsWith: "vital_" }
    },
    orderBy: { createdAt: "desc" },
    take: 1000
  });

  const stats = {
    LCP: calculateAvg(events, "vital_lcp"),
    INP: calculateAvg(events, "vital_inp"),
    CLS: calculateAvg(events, "vital_cls"),
    count: events.length
  };

  return NextResponse.json(stats);
}

function calculateAvg(events: any[], name: string) {
  const filtered = events.filter(e => e.name === name);
  if (filtered.length === 0) return null;
  const sum = filtered.reduce((acc, curr) => acc + (curr.payload?.value || 0), 0);
  return Number((sum / filtered.length).toFixed(3));
}
