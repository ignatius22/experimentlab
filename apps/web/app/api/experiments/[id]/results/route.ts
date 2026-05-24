import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getExperimentResults } from "@/lib/results";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth();
  const { id } = await params;

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await getExperimentResults(id);

    // Security check: ensure experiment belongs to user's org
    if (results.experiment.organizationId !== orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("[Results API] Failed to fetch results", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
