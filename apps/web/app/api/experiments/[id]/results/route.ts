import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
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
    const results = await getExperimentResults(id, orgId);
    return NextResponse.json(results);
  } catch (err: any) {
    if (err?.message === "Experiment not found") {
      return NextResponse.json({ error: "NotFound" }, { status: 404 });
    }
    console.error("[Results API] Failed to fetch results", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
