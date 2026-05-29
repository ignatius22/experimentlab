"use client";

import { useMemo, useState } from "react";
import type { AnalyticsEvent } from "../../lib/analytics";

type Props = {
  events: AnalyticsEvent[];
  rowHeight?: number;
  height?: number;
};

export function VirtualizedEventList({ events, rowHeight = 88, height = 520 }: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const total = events.length;
  const overscan = 6;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(height / rowHeight) + overscan * 2;
  const endIndex = Math.min(total, startIndex + visibleCount);

  const visible = useMemo(() => events.slice(startIndex, endIndex), [events, startIndex, endIndex]);

  return (
    <div
      style={{ height, overflowY: "auto", background: "var(--color-surface)", borderRadius: 12, padding: 8 }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: total * rowHeight, position: "relative" }}>
        {visible.map((event, index) => {
          const rowIndex = startIndex + index;
          return (
            <article
              key={event.id}
              style={{
                position: "absolute",
                top: rowIndex * rowHeight,
                left: 0,
                right: 0,
                height: rowHeight - 8,
                padding: 8,
                borderBottom: "1px solid #e5e7eb"
              }}
            >
              <strong>{event.type}</strong>
              <p style={{ margin: "4px 0" }}>{new Date(event.timestamp).toLocaleTimeString()}</p>
              <p style={{ margin: 0, color: "var(--color-muted)" }}>{JSON.stringify(event.payload)}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
