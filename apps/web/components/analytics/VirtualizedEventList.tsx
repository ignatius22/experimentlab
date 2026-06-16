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
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong style={{ color: "var(--color-accent)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{event.type}</strong>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-dim)" }}>{new Date(event.timestamp).toLocaleString()}</span>
              </div>
              <p style={{ margin: "4px 0", fontWeight: 600, fontSize: "1rem" }}>
                {String(event.payload.name || event.payload.path || "unnamed_event")}
              </p>
              <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {Object.keys(event.payload).length > 1 ? JSON.stringify(event.payload) : ""}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
