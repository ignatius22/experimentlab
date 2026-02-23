"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSessionUserId } from "../../lib/auth/session";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const userId = getSessionUserId();
    if (!userId && pathname.startsWith("/app")) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return <p className="container">Checking session...</p>;
  }

  return <>{children}</>;
}
