import { Prisma } from "@prisma/client";
import { prisma } from "@experiment/db";

export type TrendRow = { bucket: Date; evaluations: bigint; conversions: bigint };

export async function queryTrendRows(organizationId: string, range: string, now = new Date()) {
  const config = range === "daily"
    ? { unit: Prisma.raw("'day'"), start: new Date(now.getTime() - 6 * 86400000) }
    : range === "weekly"
      ? { unit: Prisma.raw("'week'"), start: new Date(now.getTime() - 35 * 86400000) }
      : { unit: Prisma.raw("'month'"), start: new Date(now.getFullYear(), now.getMonth() - 5, 1) };
  return prisma.$queryRaw<TrendRow[]>(Prisma.sql`
    SELECT date_trunc(${config.unit}, "createdAt") AS bucket,
      COUNT(*) FILTER (WHERE type = 'exposure')::bigint AS evaluations,
      COUNT(*) FILTER (WHERE type IN ('track', 'conversion'))::bigint AS conversions
    FROM "Event"
    WHERE "organizationId" = ${organizationId} AND "createdAt" >= ${config.start}
    GROUP BY 1 ORDER BY 1
  `);
}

export function formatTrendRows(rows: TrendRow[], range: string, now = new Date()) {
  const count = range === "daily" ? 7 : 6;
  return Array.from({ length: count }, (_, index) => {
    const date = range === "daily" ? new Date(now.getTime() - (6 - index) * 86400000) : range === "weekly" ? startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 * (5 - index))) : new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const row = rows.find((candidate) => bucketKey(candidate.bucket, range) === bucketKey(date, range));
    return { label: range === "daily" ? date.toLocaleDateString("en-US", { weekday: "short" }) : range === "weekly" ? `W${index + 1}` : date.toLocaleDateString("en-US", { month: "short" }), evaluations: Number(row?.evaluations || 0), conversions: Number(row?.conversions || 0) };
  });
}

function startOfWeek(date: Date) { const result = new Date(date); result.setDate(result.getDate() - result.getDay()); result.setHours(0, 0, 0, 0); return result; }
function bucketKey(date: Date, range: string) { const value = new Date(date); if (range === "weekly") return startOfWeek(value).toISOString().slice(0, 10); return range === "monthly" ? `${value.getFullYear()}-${value.getMonth()}` : value.toISOString().slice(0, 10); }
