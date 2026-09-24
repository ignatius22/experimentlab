"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isProtected = pathname.startsWith("/app");

  useEffect(() => {
    // Check if auth cookie or session is accessible
    if (typeof document !== "undefined" && isProtected) {
      const hasSession = document.cookie.includes("experimentlab_session");
      if (!hasSession) {
        // Soft-check: Server-side Middleware handles full redirect
      }
    }
  }, [isProtected, pathname, router]);

  return <>{children}</>;
}
