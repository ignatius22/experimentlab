import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAuthSecret } from "../../lib/auth/config";

describe("Auth Config & Secrets Security", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws a fatal error in production if AUTH_SECRET is not configured", () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    delete process.env.AUTH_SECRET;

    expect(() => getAuthSecret()).toThrowError(/FATAL: AUTH_SECRET/);
  });

  it("returns encoded secret when AUTH_SECRET is provided in production", () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.AUTH_SECRET = "production_super_secret_key_1234567890123456";

    const secret = getAuthSecret();
    expect(ArrayBuffer.isView(secret)).toBe(true);
    expect(secret.constructor.name).toBe("Uint8Array");
    expect(new TextDecoder().decode(secret)).toBe("production_super_secret_key_1234567890123456");
  });

  it("returns safe development secret in development mode when unset", () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    delete process.env.AUTH_SECRET;

    const secret = getAuthSecret();
    expect(ArrayBuffer.isView(secret)).toBe(true);
    expect(secret.constructor.name).toBe("Uint8Array");
    expect(new TextDecoder().decode(secret)).toContain("development");
  });
});
