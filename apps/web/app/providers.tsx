"use client";

import { ExperimentProvider } from "experimentlab-react";
import { useEffect, useState } from "react";
import { initWebVitals } from "../lib/webVitals";

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; orgId: string } | null>(null);

  useEffect(() => {
    // 1. Initialize Core Web Vitals telemetry collector
    initWebVitals();

    // 2. Fetch authenticated session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser({
            id: data.user.userId,
            orgId: data.user.orgId
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ExperimentProvider
      publishableKey={user ? "__dashboard_session__" : undefined}
      userId={user?.id || "anon"}
      baseUrl=""
    >
      {children}
    </ExperimentProvider>
  );
}
