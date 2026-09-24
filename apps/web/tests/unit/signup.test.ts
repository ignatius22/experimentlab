import { describe, expect, it, vi } from "vitest";

vi.mock("@experiment/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    organization: { create: vi.fn() }
  }
}));

vi.mock("@/lib/auth/session", () => ({
  createSession: vi.fn().mockResolvedValue("mock-jwt")
}));

import { POST } from "../../app/api/auth/signup/route";

describe("Signup Input Validation", () => {
  it("rejects invalid email formats", async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email", password: "securepassword123" })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("email");
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "valid@example.com", password: "short" })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("8 characters");
  });

  it("rejects passwords longer than 72 characters", async () => {
    const longPassword = "a".repeat(73);
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "valid@example.com", password: longPassword })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("72 characters");
  });
});
