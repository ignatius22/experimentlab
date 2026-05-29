"use client";

import { useEffect, useSyncExternalStore } from "react";
import { subscribeEvents, getEvents, seedLargeEventStream } from "../../../../lib/analytics";
import { VirtualizedEventList } from "../../../../components/analytics/VirtualizedEventList";

export default function AnalyticsPage() {
  const events = useSyncExternalStore(subscribeEvents, getEvents, getEvents);

  useEffect(() => {
    seedLargeEventStream(10000);
  }, []);

  return (
    <section className="stack">
      <header>
        <h1 style={{ fontSize: "1.8rem" }}>Event Stream</h1>
        <p style={{ color: "var(--color-text-muted)" }}>Real-time feed of all experiments and flag evaluations.</p>
      </header>
      <div style={{ marginTop: "var(--space-4)" }}>
        <VirtualizedEventList events={events} />
      </div>
    </section>
  );
}

