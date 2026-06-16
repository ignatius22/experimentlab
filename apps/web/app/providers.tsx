"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ExperimentProvider } from "@experiment/sdk-react";
import { ExperimentClient } from "@experiment/sdk-core";
import { initWebVitals } from "../lib/webVitals";
import { identify, page, track, exposure } from "../lib/analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userId, orgId } = useAuth();

  const client = useMemo(() => {
    if (!userId || !orgId) return null;
    return new ExperimentClient({
      publishableKey: orgId,
      userId,
      onEvent: (event) => {
        if (event.type === "track") {
          track(event.name, event.payload);
        } else if (event.type === "exposure") {
          exposure(event.name, event.variantId || "");
        }
      }
    });
  }, [userId, orgId]);

  useEffect(() => {
    initWebVitals();

    if (userId) {
      identify(userId, { plan: "pro" });
    }
  }, [userId]);

  useEffect(() => {
    page(pathname);
  }, [pathname]);

  if (!client) {
    return <>{children}</>;
  }

  return (
    <ExperimentProvider client={client}>
      {children}
    </ExperimentProvider>
  );
}
