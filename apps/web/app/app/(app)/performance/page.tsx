"use client";

import { useSyncExternalStore } from "react";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";

import { Card } from "@experiment/ui";

export default function PerformancePage() {
  const vitals = useSyncExternalStore(subscribeVitals, getVitals, getVitals);

  return (
    <section className="stack">
      <header>
        <h1 style={{ fontSize: "1.8rem" }}>Performance</h1>
        <p style={{ color: "var(--color-text-muted)" }}>Live Core Web Vitals monitoring from your users.</p>
      </header>

      <div className="grid">
        <Card style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <h3 style={{ color: "var(--color-text-dim)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>LCP</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, marginTop: 12, color: "var(--color-accent)" }}>{vitals.LCP ?? "—"}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 8 }}>Largest Contentful Paint</p>
        </Card>
        <Card style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <h3 style={{ color: "var(--color-text-dim)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>INP</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, marginTop: 12, color: "var(--color-accent)" }}>{vitals.INP ?? "—"}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 8 }}>Interaction to Next Paint</p>
        </Card>
        <Card style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <h3 style={{ color: "var(--color-text-dim)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>CLS</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, marginTop: 12, color: "var(--color-accent)" }}>{vitals.CLS ?? "—"}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 8 }}>Cumulative Layout Shift</p>
        </Card>
      </div>
    </section>
  );
}

