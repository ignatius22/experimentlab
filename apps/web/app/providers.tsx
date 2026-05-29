"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ExperimentProvider } from "@experiment/sdk-react";
import { ExperimentClient } from "@experiment/sdk-core";
import { initWebVitals } from "../lib/webVitals";
import { identify, page } from "../lib/analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userId, orgId } = useAuth();

  const client = useMemo(() => {
    if (!userId || !orgId) return null;
    return new ExperimentClient({
      publishableKey: orgId,
      userId
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
