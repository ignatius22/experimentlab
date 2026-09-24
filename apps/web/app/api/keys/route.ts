import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@experiment/db";
import { generateApiKey } from "@/lib/keys";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existingKeys = await prisma.apiKey.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      revokedAt: true
    }
  });

  return NextResponse.json({ keys: existingKeys });
}

export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let name = "";
  let type: "client" | "server" = "client";
  try {
    const body = await req.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    if (body.type === "client" || body.type === "server") type = body.type;
  } catch (e) {
    // The request is invalid below because a name is required.
  }

  if (!name || name.length > 80) {
    return NextResponse.json({ error: "Key name is required and must be 80 characters or fewer" }, { status: 400 });
  }

  const { rawKey, keyHash } = generateApiKey(type);

  const created = await prisma.apiKey.create({
    data: {
      organizationId: orgId,
      name,
      keyHash,
      type
    },
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      revokedAt: true
    }
  });

  // Return the plaintext key ONCE to the authenticated user. Never log rawKey.
  return NextResponse.json({
    success: true,
    key: rawKey,
    apiKey: created
  }, { status: 201 });
}
