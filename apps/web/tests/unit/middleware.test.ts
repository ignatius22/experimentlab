import { describe, it, expect } from "vitest";
import { middleware } from "../../middleware";
import { NextRequest } from "next/server";

describe("Auth Middleware Route Coverage", () => {
  it("allows /api/v1/client/manifest without any session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/client/manifest?apiKey=exp_live_123");
    const res = await middleware(req);

    // Should proceed to next() without returning 401 or redirecting
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows /api/v1/client/events without any session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/client/events?apiKey=exp_live_123", {
      method: "POST"
    });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows public /api/auth routes without session cookie", async () => {
    const loginReq = new NextRequest("http://localhost:3000/api/auth/login", { method: "POST" });
    const signupReq = new NextRequest("http://localhost:3000/api/auth/signup", { method: "POST" });

    expect((await middleware(loginReq)).status).toBe(200);
    expect((await middleware(signupReq)).status).toBe(200);
  });

  it("blocks unauthorized /api/flags with a JSON 401 status", async () => {
    const req = new NextRequest("http://localhost:3000/api/flags");
    const res = await middleware(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Unauthorized");
  });

  it("blocks unauthorized /api/experiments with a JSON 401 status", async () => {
    const req = new NextRequest("http://localhost:3000/api/experiments");
    const res = await middleware(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Unauthorized");
  });

  it("redirects unauthorized /app routes to /login", async () => {
    const req = new NextRequest("http://localhost:3000/app/flags");
    const res = await middleware(req);

    expect(res.status).toBe(307); // NextResponse.redirect
    expect(res.headers.get("location")).toContain("/login?redirect=%2Fapp%2Fflags");
  });
});
