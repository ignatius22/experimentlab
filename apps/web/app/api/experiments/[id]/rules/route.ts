import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@experiment/db";
import { RuleSchema } from "@experiment/schemas";
import { z } from "zod";

const UpdateRulesSchema = z.array(RuleSchema);

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateRulesSchema.safeParse(body.rules);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rules format" }, { status: 400 });
  }

  try {
    const updated = await prisma.experiment.update({
      where: { id, organizationId: orgId },
      data: { rules: parsed.data as any }
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update rules" }, { status: 500 });
  }
}
