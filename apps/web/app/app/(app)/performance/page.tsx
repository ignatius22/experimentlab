"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";
import { Card, Badge, Button, Loader } from "@experiment/ui";
import { RefreshCw, Zap, Users, Monitor } from "lucide-react";

type GlobalStats = {
  LCP: number | null;
  INP: number | null;
  CLS: number | null;
  count: number;
};

export default function PerformancePage() {
  const sessionVitals = useSyncExternalStore(subscribeVitals, getVitals, getVitals);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/performance");
      if (res.ok) setGlobalStats(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  return (
    <section className="stack">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>Performance</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Live Core Web Vitals monitoring from your users.</p>
        </div>
        <Button onClick={fetchGlobalStats} variant="secondary" style={{ padding: "8px 12px" }}>
          <RefreshCw size={16} style={{ marginRight: 8 }} className={loading ? "spin" : ""} />
          Refresh Global Data
        </Button>
      </header>

      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Users size={18} color="var(--color-accent)" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Global Averages (Last 1000 Events)</h2>
        </div>
        {loading && !globalStats ? (
          <Loader label="Calculating performance benchmarks..." />
        ) : (
          <div className="grid">
            <VitalCard 
              label="LCP" 
              value={globalStats?.LCP} 
              description="Largest Contentful Paint" 
              unit="ms"
              thresholds={{ good: 2500, poor: 4000 }}
            />
            <VitalCard 
              label="INP" 
              value={globalStats?.INP} 
              description="Interaction to Next Paint" 
              unit="ms"
              thresholds={{ good: 200, poor: 500 }}
            />
            <VitalCard 
              label="CLS" 
              value={globalStats?.CLS} 
              description="Cumulative Layout Shift" 
              unit=""
              thresholds={{ good: 0.1, poor: 0.25 }}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Monitor size={18} color="var(--color-accent)" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Your Current Session</h2>
        </div>
        <div className="grid">
          <VitalCard 
            label="LCP" 
            value={sessionVitals.LCP} 
            description="Your current page load speed" 
            unit="ms"
            thresholds={{ good: 2500, poor: 4000 }}
          />
          <VitalCard 
            label="INP" 
            value={sessionVitals.INP} 
            description="Your current interaction lag" 
            unit="ms"
            thresholds={{ good: 200, poor: 500 }}
          />
          <VitalCard 
            label="CLS" 
            value={sessionVitals.CLS} 
            description="Your current layout stability" 
            unit=""
            thresholds={{ good: 0.1, poor: 0.25 }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </section>
  );
}

function VitalCard({ 
  label, 
  value, 
  description, 
  unit, 
  thresholds 
}: { 
  label: string; 
  value: number | null | undefined; 
  description: string; 
  unit: string;
  thresholds: { good: number; poor: number };
}) {
  const getStatus = (val: number) => {
    if (val <= thresholds.good) return { label: "Good", variant: "success" as const };
    if (val <= thresholds.poor) return { label: "Needs Improvement", variant: "warning" as const };
    return { label: "Poor", variant: "danger" as const };
  };

  const status = value !== null && value !== undefined ? getStatus(value) : null;

  return (
    <Card style={{ textAlign: "center", padding: "var(--space-8)", position: "relative" }}>
      {status && (
        <Badge 
          variant={status.variant} 
          style={{ position: "absolute", top: 12, right: 12, fontSize: "0.7rem" }}
        >
          {status.label}
        </Badge>
      )}
      <h3 style={{ color: "var(--color-text-dim)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</h3>
      <p style={{ fontSize: "2.5rem", fontWeight: 700, marginTop: 12, color: status ? `var(--color-${status.variant})` : "var(--color-text-dim)" }}>
        {value ?? "—"}<span style={{ fontSize: "1rem", fontWeight: 400, marginLeft: 4 }}>{value !== null ? unit : ""}</span>
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 8 }}>{description}</p>
    </Card>
  );
}

