import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { formatTrendRows, queryTrendRows } from "@/lib/trends";

export async function GET(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const range = new URL(req.url).searchParams.get("range") || "monthly";
  const normalizedRange = ["daily", "weekly", "monthly"].includes(range) ? range : "monthly";
  return NextResponse.json({ data: formatTrendRows(await queryTrendRows(orgId, normalizedRange), normalizedRange) });
}
