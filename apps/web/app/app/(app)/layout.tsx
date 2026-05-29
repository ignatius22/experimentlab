"use client";

import { AppNav } from "@/components/app-shell/AppNav";
import { Beaker } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="ui-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
          <Beaker size={24} color="var(--color-accent)" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>ExperimentLab</h2>
        </div>
        <AppNav orientation="vertical" />
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

