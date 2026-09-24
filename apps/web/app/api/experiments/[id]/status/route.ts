import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";

import { z } from "zod";

const StatusSchema = z.enum(["draft", "running", "active", "paused", "completed"]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = StatusSchema.safeParse(body.status);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const experiment = await prisma.experiment.findUnique({ where: { id } });
  if (!experiment || experiment.organizationId !== orgId) {
    return NextResponse.json({ error: "NotFound" }, { status: 404 });
  }

  const updated = await prisma.experiment.update({
    where: { id },
    data: { status: parsed.data }
  });

  return NextResponse.json(updated);
}
