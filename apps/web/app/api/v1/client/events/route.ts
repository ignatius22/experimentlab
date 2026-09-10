import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/keys";
import { auth } from "@/lib/auth/server";
import { enqueueEventBatch } from "@/lib/event-ingestion";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawApiKey =
    searchParams.get("apiKey") ||
    req.headers.get("x-api-key") ||
    req.headers.get("authorization");

  if (!rawApiKey) {
    const response = NextResponse.json({ error: "Missing API key" }, { status: 401 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  const organizationId = rawApiKey === "__dashboard_session__"
    ? (await auth()).orgId
    : (await validateApiKey(rawApiKey))?.organizationId;
  if (!organizationId) {
    const response = NextResponse.json({ error: "Unauthorized: Invalid or revoked API key" }, { status: 401 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  try {
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];

    if (events.length === 0) {
      return NextResponse.json({ success: true });
    }

    if (events.length > 1000) return NextResponse.json({ error: "BatchTooLarge" }, { status: 413 });
    const batchId = await enqueueEventBatch(organizationId, events);

    const response = NextResponse.json({ accepted: true, batchId }, { status: 202 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch (err) {
    console.error("[Events API] Failed to ingest events", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  return response;
}
