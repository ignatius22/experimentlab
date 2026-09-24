import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [flags, experiments, keys] = await Promise.all([
    prisma.featureFlag.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, enabled: true, createdAt: true } }),
    prisma.experiment.findMany({ where: { organizationId: orgId }, orderBy: { updatedAt: "desc" }, take: 4, select: { id: true, name: true, status: true, updatedAt: true } }),
    prisma.apiKey.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, revokedAt: true, createdAt: true } })
  ]);

  const notifications = [
    ...experiments.map((item) => ({ id: `experiment-${item.id}-${item.updatedAt.toISOString()}`, title: item.name, detail: `Experiment is ${item.status}.`, href: `/app/experiments/${item.id}`, createdAt: item.updatedAt.toISOString() })),
    ...flags.map((item) => ({ id: `flag-${item.id}`, title: item.name, detail: item.enabled ? "Feature flag is enabled." : "Feature flag was created.", href: "/app/flags", createdAt: item.createdAt.toISOString() })),
    ...keys.map((item) => ({ id: `key-${item.id}`, title: item.name, detail: item.revokedAt ? "API key was revoked." : "API key was created.", href: "/app/settings#api-keys", createdAt: (item.revokedAt || item.createdAt).toISOString() }))
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 8);

  return NextResponse.json({ notifications });
}
