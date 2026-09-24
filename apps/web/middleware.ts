import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret } from "./lib/auth/config";

const COOKIE_NAME = "experimentlab_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Exclude public API routes from session auth
  if (
    pathname.startsWith("/api/v1/client") || // Public client SDK endpoints
    pathname.startsWith("/api/auth") ||      // Login, signup, logout
    pathname.startsWith("/api/webhooks")     // Webhooks verify their provider signature
  ) {
    return NextResponse.next();
  }

  // 2. Protect authenticated /api routes
  if (pathname.startsWith("/api")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing session" }, { status: 401 });
    }

    try {
      const secret = getAuthSecret();
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired session" }, { status: 401 });
    }
  }

  // 3. Protect /app routes (redirect browser to login)
  if (pathname.startsWith("/app")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = getAuthSecret();
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"]
};
