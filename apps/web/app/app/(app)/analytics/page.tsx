"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { subscribeEvents, getEvents, setEvents } from "../../../../lib/analytics";
import { VirtualizedEventList } from "../../../../components/analytics/VirtualizedEventList";
import { AnalyticsCharts } from "../../../../components/analytics/AnalyticsCharts";
import { RefreshCw, Filter, BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  const events = useSyncExternalStore(subscribeEvents, getEvents, getEvents);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics?limit=500");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((e: any) => ({
          id: e.id,
          type: e.type,
          timestamp: e.createdAt,
          payload: { 
            name: e.name, 
            variant: e.variantId, 
            ...e.payload 
          }
        }));
        setEvents(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredEvents = activeFilter 
    ? events.filter(e => e.type === activeFilter)
    : events;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Analytics</h3>
          <p className="text-muted m-0" style={{ fontSize: "0.875rem" }}>
            Follow experiment exposures, conversions, and flag evaluations as they arrive.
          </p>
        </div>
        <button 
          onClick={fetchHistory} 
          className="btn btn-coup-light d-flex align-items-center gap-2 shadow-xs"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Visual Analytics & Velocity Charts in Coup Box */}
      <AnalyticsCharts events={events} />

      {/* Stream Controls & Filter Bar in Coup Box */}
      <div className="box rounded-4 b-1 mb-4">
        <div className="box-body p-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Filter size={16} className="text-muted me-1" />
              <span className="small fw-bold text-dark me-2">Filter Stream:</span>
              {[
                { label: "All Events", val: null },
                { label: "Exposures", val: "exposure" },
                { label: "Conversions (Track)", val: "track" },
                { label: "Page Views", val: "page" }
              ].map((item) => (
                <button
                  key={String(item.val)}
                  onClick={() => setActiveFilter(item.val)}
                  className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                    activeFilter === item.val
                      ? "btn-primary text-white shadow-xs"
                      : "btn-light text-secondary border-0"
                  }`}
                  style={{ fontSize: "0.8rem" }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="small text-muted font-monospace">
              Showing <strong className="text-dark">{filteredEvents.length}</strong> events in buffer
            </div>
          </div>
        </div>
      </div>

      {/* Virtualized Event List Container in Coup Box */}
      <div className="box rounded-4 b-1 overflow-hidden shadow-sm">
        <div className="box-body p-0">
          <VirtualizedEventList events={filteredEvents} />
        </div>
      </div>
    </div>
  );
}
