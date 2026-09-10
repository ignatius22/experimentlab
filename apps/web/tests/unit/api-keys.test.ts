import { describe, it, expect, vi } from "vitest";
import { generateApiKey, hashApiKey, validateApiKey, API_KEY_PREFIX } from "../../lib/keys";
import { prisma } from "@experiment/db";

vi.mock("@experiment/db", () => ({
  prisma: {
    apiKey: {
      findFirst: vi.fn()
    }
  }
}));

describe("API Key Utilities", () => {
  it("generates a secure key with the exp_live_ prefix and valid SHA-256 hash", () => {
    const { rawKey, keyHash, type } = generateApiKey("client");

    expect(rawKey.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(rawKey.length).toBeGreaterThan(20);
    expect(type).toBe("client");
    expect(keyHash).toBe(hashApiKey(rawKey));
    expect(keyHash).toHaveLength(64); // SHA-256 hex length
  });

  it("produces deterministic SHA-256 hashes", () => {
    const key = "exp_live_abcdef0123456789";
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(key);
  });

  it("rejects invalid, null, or empty API keys during validation", async () => {
    expect(await validateApiKey(null)).toBeNull();
    expect(await validateApiKey("")).toBeNull();
    expect(await validateApiKey("invalid_prefix_12345")).toBeNull();
    expect(await validateApiKey("org_cmtcwyyir0000hkda9plwxgy8")).toBeNull(); // Reject raw orgId!
  });

  it("validates and resolves organizationId from an active ApiKey record", async () => {
    const { rawKey, keyHash } = generateApiKey("client");

    const mockRecord = {
      id: "key_123",
      organizationId: "org_abc",
      keyHash,
      type: "client",
      createdAt: new Date(),
      revokedAt: null
    };

    vi.mocked(prisma.apiKey.findFirst).mockResolvedValueOnce(mockRecord as any);

    const result = await validateApiKey(rawKey);
    expect(result).not.toBeNull();
    expect(result?.organizationId).toBe("org_abc");
    expect(prisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: {
        keyHash,
        revokedAt: null
      }
    });
  });

  it("supports Bearer authorization header format", async () => {
    const { rawKey, keyHash } = generateApiKey("client");

    const mockRecord = {
      id: "key_456",
      organizationId: "org_xyz",
      keyHash,
      type: "client",
      createdAt: new Date(),
      revokedAt: null
    };

    vi.mocked(prisma.apiKey.findFirst).mockResolvedValueOnce(mockRecord as any);

    const result = await validateApiKey(`Bearer ${rawKey}`);
    expect(result?.organizationId).toBe("org_xyz");
  });

  it("returns null if API key is revoked in the database", async () => {
    const { rawKey } = generateApiKey("client");

    // findFirst returns null because revokedAt: null constraint doesn't match
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValueOnce(null);

    const result = await validateApiKey(rawKey);
    expect(result).toBeNull();
  });
});
