/**
 * Single source of truth for authentication secret configuration.
 * Fails loudly in production if AUTH_SECRET is not configured.
 */
export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: AUTH_SECRET environment variable is missing in production! Startup blocked to prevent insecure sessions."
      );
    }
    // Safe deterministic development secret (never permitted in production)
    return new TextEncoder().encode("experimentlab_development_jwt_secret_do_not_use_in_production");
  }

  return new TextEncoder().encode(secret);
}
