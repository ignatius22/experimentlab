"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Activity, ArrowUpRight, CheckCircle2, Eye, Flag, Zap, Clock } from "lucide-react";

interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: string;
  payload?: any;
}

export function VirtualizedEventList({ events }: { events: AnalyticsEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const itemHeight = 68;
  const viewportHeight = 520;

  const totalHeight = events.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 4);
  const endIndex = Math.min(events.length, Math.floor((scrollTop + viewportHeight) / itemHeight) + 4);

  const visibleEvents = useMemo(() => {
    return events.slice(startIndex, endIndex).map((event, index) => ({
      event,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }));
  }, [events, startIndex, endIndex, itemHeight]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <Clock size={36} className="text-muted opacity-50 mb-2" />
        <p className="m-0 fw-bold text-dark">No live events captured yet</p>
        <p className="text-muted small">Send evaluations or conversions from your client app to see real-time ingestion.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="position-relative overflow-y-auto"
      style={{ height: viewportHeight }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleEvents.map(({ event, top }) => {
          const isExposure = event.type === "exposure";
          const isTrack = event.type === "track";
          const isPage = event.type === "page";

          const formattedTime = new Date(event.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={event.id}
              className="position-absolute start-0 w-100 px-4 py-2.5 border-bottom d-flex align-items-center justify-content-between bg-white hover-bg-light"
              style={{ top, height: itemHeight }}
            >
              <div className="d-flex align-items-center gap-3 overflow-hidden">
                <div 
                  className={`p-2 rounded-3 d-flex align-items-center justify-content-center ${
                    isExposure ? "bg-primary-light text-primary" : isTrack ? "bg-success-light text-success" : "bg-light text-secondary"
                  }`}
                  style={{ width: 38, height: 38 }}
                >
                  {isExposure && <Flag size={16} />}
                  {isTrack && <CheckCircle2 size={16} />}
                  {isPage && <Eye size={16} />}
                </div>

                <div className="truncate">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark font-monospace" style={{ fontSize: "0.85rem" }}>
                      {event.payload?.name || event.payload?.flagKey || event.type}
                    </span>
                    <span 
                      className={`badge rounded-pill fw-bold ${
                        isExposure ? "badge-primary-light" : isTrack ? "badge-success-light" : "bg-light text-secondary"
                      }`}
                      style={{ fontSize: "0.65rem" }}
                    >
                      {event.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-muted small text-truncate" style={{ fontSize: "0.75rem" }}>
                    {event.payload?.variant ? `Variant: ${event.payload.variant}` : JSON.stringify(event.payload || {})}
                  </div>
                </div>
              </div>

              <div className="text-end font-monospace text-muted small ps-3">
                {formattedTime}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
