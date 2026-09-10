import { NextResponse } from "next/server";
import { prisma } from "@experiment/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, orgName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const organization = await prisma.organization.create({
      data: {
        name: orgName || `${name || email.split("@")[0]}'s Org`
      }
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        organizationId: organization.id
      }
    });

    await createSession({
      userId: user.id,
      email: user.email,
      orgId: organization.id,
      orgName: organization.name
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, orgId: organization.id, orgName: organization.name }
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}
