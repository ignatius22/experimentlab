import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/keys";
import { auth } from "@/lib/auth/server";
import { enqueueEventBatch } from "@/lib/event-ingestion";

import { IngestEventBatchSchema } from "@experiment/schemas";

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
    const rawEvents = Array.isArray(body) ? body : [body];

    if (rawEvents.length === 0) {
      const response = NextResponse.json({ success: true });
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    if (rawEvents.length > 1000) {
      const response = NextResponse.json({ error: "BatchTooLarge" }, { status: 413 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    const parsed = IngestEventBatchSchema.safeParse(rawEvents);
    if (!parsed.success) {
      const response = NextResponse.json({ error: "InvalidEventPayload", details: parsed.error.issues }, { status: 400 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    const batchId = await enqueueEventBatch(organizationId, parsed.data as any);

    const response = NextResponse.json({ accepted: true, batchId }, { status: 202 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch (err) {
    console.error("[Events API] Failed to ingest events", err);
    const response = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  return response;
}
