import crypto from "crypto";
import { prisma } from "@experiment/db";

export const API_KEY_PREFIX = "exp_live_";

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(type: "client" | "server" = "client") {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `${API_KEY_PREFIX}${randomBytes}`;
  const keyHash = hashApiKey(rawKey);

  return {
    rawKey,
    keyHash,
    type
  };
}

export async function validateApiKey(rawKey: string | null | undefined) {
  if (!rawKey || typeof rawKey !== "string") {
    return null;
  }

  const trimmed = rawKey.trim().replace(/^Bearer\s+/i, "");
  if (!trimmed.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  const keyHash = hashApiKey(trimmed);

  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      revokedAt: null
    }
  });

  return apiKeyRecord;
}
