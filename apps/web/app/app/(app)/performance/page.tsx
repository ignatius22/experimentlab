"use client";

import { useSyncExternalStore } from "react";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";

export default function PerformancePage() {
  const vitals = useSyncExternalStore(subscribeVitals, getVitals, getVitals);

  return (
    <section className="stack">
      <h2>Performance Dashboard</h2>
      <p>Optimization: 10k-event stream switched from naive rendering to virtualized list + rAF batched ingestion.</p>
      <div className="grid">
        <article style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
          <h3>LCP</h3>
          <p>{vitals.LCP ?? "waiting"}</p>
        </article>
        <article style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
          <h3>INP</h3>
          <p>{vitals.INP ?? "waiting"}</p>
        </article>
        <article style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
          <h3>CLS</h3>
          <p>{vitals.CLS ?? "waiting"}</p>
        </article>
      </div>
    </section>
  );
}

