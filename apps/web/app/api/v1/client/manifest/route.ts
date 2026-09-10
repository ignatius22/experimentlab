import { NextResponse } from "next/server";
import { prisma } from "@experiment/db";
import { validateApiKey } from "@/lib/keys";
import { auth } from "@/lib/auth/server";

export async function GET(req: Request) {
  try {
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

    const apiKey = rawApiKey === "__dashboard_session__" ? null : await validateApiKey(rawApiKey);
    const organizationId = rawApiKey === "__dashboard_session__" ? (await auth()).orgId : apiKey?.organizationId;
    if (!organizationId) {
      const response = NextResponse.json({ error: "Unauthorized: Invalid or revoked API key" }, { status: 401 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    // Client keys are safe to embed in SDKs and receive only published data.
    // Server keys are intentionally broader for trusted backend preview/testing.
    const isServerKey = rawApiKey === "__dashboard_session__" || apiKey?.type === "server";
    const [flags, experiments] = await Promise.all([
      prisma.featureFlag.findMany({
        where: isServerKey ? { organizationId } : { organizationId, enabled: true }
      }),
      prisma.experiment.findMany({
        where: isServerKey
          ? { organizationId }
          : { organizationId, status: { in: ["active", "completed"] } }
      })
    ]);

    const response = NextResponse.json({
      flags: flags.map(f => ({
        key: f.key,
        enabled: f.enabled,
        rules: f.rules || []
      })),
      experiments: experiments.map(e => ({
        key: e.key,
        variants: e.variants,
        rollout: e.rollout,
        status: e.status,
        metrics: e.metrics || [],
        rules: e.rules || [],
        winningVariantId: e.winningVariantId
      }))
    });

    // Basic CORS for client-side SDK calls
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    return response;
  } catch (error) {
    console.error("[Manifest API Error]", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  return response;
}
