import { NextResponse } from "next/server";
import { prisma } from "@experiment/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
  }

  const [flags, experiments] = await Promise.all([
    prisma.featureFlag.findMany({
      where: { organizationId: apiKey, enabled: true }
    }),
    prisma.experiment.findMany({
      where: { organizationId: apiKey, status: "active" }
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
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  return response;
}
