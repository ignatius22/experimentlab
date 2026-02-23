"use client";

import { AppNav } from "../../components/app-shell/AppNav";
import { RouteGuard } from "../../components/app-shell/RouteGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="container stack">
        <header className="grid" style={{ gridTemplateColumns: "1fr auto" }}>
          <h1 style={{ margin: 0 }}>ExperimentLab App</h1>
          <AppNav />
        </header>
        {children}
      </div>
    </RouteGuard>
  );
}
