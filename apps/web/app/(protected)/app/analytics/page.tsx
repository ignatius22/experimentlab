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
      <h2>Analytics Event Stream</h2>
      <p>Rendering 10,000 events using virtualization + requestAnimationFrame batched updates.</p>
      <VirtualizedEventList events={events} />
    </section>
  );
}

