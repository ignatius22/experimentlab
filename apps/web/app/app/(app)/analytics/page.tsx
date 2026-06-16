"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { subscribeEvents, getEvents, setEvents } from "../../../../lib/analytics";
import { VirtualizedEventList } from "../../../../components/analytics/VirtualizedEventList";
import { Badge, Button, Loader } from "@experiment/ui";
import { RefreshCw, Filter } from "lucide-react";

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
        // Map DB event structure to AnalyticsEvent structure
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
    <section className="stack">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>Event Stream</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Real-time feed of all experiments and flag evaluations.</p>
        </div>
        <Button onClick={fetchHistory} variant="secondary" style={{ padding: "8px 12px" }}>
          <RefreshCw size={16} style={{ marginRight: 8 }} className={loading ? "spin" : ""} />
          Refresh
        </Button>
      </header>

      <div style={{ display: "flex", gap: 8, marginTop: 24, marginBottom: 12, alignItems: "center" }}>
        <Filter size={16} color="var(--color-text-dim)" />
        <span style={{ fontSize: "0.85rem", marginRight: 8, fontWeight: 500 }}>Filter:</span>
        {[null, "exposure", "track", "page"].map((type) => (
          <Badge 
            key={String(type)}
            variant={activeFilter === type ? "accent" : "neutral"}
            style={{ cursor: "pointer", padding: "4px 12px" }}
            onClick={() => setActiveFilter(type)}
          >
            {type === null ? "All" : type.toUpperCase()}
          </Badge>
        ))}
      </div>

      <div style={{ marginTop: "var(--space-4)" }}>
        {loading && events.length === 0 ? (
          <Loader label="Loading event history..." />
        ) : (
          <VirtualizedEventList events={filteredEvents} />
        )}
      </div>
      
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </section>
  );
}

