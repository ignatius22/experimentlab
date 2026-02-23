"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initWebVitals } from "../lib/webVitals";
import { identify, page } from "../lib/analytics";
import { getSessionUserId } from "../lib/auth/session";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
      void (async () => {
        const { startMocking } = await import("../mocks/browser");
        await startMocking();
      })();
    }

    initWebVitals();

    const userId = getSessionUserId();
    if (userId) {
      identify(userId, { plan: "pro" });
    }
  }, []);

  useEffect(() => {
    page(pathname);
  }, [pathname]);

  return <>{children}</>;
}
