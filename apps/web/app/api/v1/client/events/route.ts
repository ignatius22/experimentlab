import { NextResponse } from "next/server";
import { prisma } from "@experiment/db";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];

    await prisma.event.createMany({
      data: events.map((e: any) => ({
        organizationId: apiKey,
        userId: e.userId,
        type: e.type,
        name: e.name,
        variantId: e.variantId,
        payload: e.payload || {}
      }))
    });

    const response = NextResponse.json({ success: true });
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
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
