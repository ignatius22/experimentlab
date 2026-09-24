import crypto from "crypto";
import { prisma } from "@experiment/db";

export const CLIENT_API_KEY_PREFIX = "exp_client_";
export const SERVER_API_KEY_PREFIX = "exp_server_";
export const LEGACY_API_KEY_PREFIX = "exp_live_";
export const API_KEY_PREFIX = LEGACY_API_KEY_PREFIX;
export const VALID_KEY_PREFIXES = [CLIENT_API_KEY_PREFIX, SERVER_API_KEY_PREFIX, LEGACY_API_KEY_PREFIX];

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(type: "client" | "server" = "client") {
  const prefix = type === "server" ? SERVER_API_KEY_PREFIX : CLIENT_API_KEY_PREFIX;
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `${prefix}${randomBytes}`;
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
  const hasValidPrefix = VALID_KEY_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
  if (!hasValidPrefix) {
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
