"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";
import { Card, Badge, Button, Loader } from "@experiment/ui";
import { RefreshCw, Zap, Users, Monitor, ShieldCheck, Activity } from "lucide-react";

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
  const hasSessionMeasurement = Object.values(sessionVitals).some((value) => value !== null);

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
    <div className="stack" style={{ gap: "var(--space-8)" }}>
      <header className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          </div>
          <h1 style={{ fontSize: "2rem" }}>Performance</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Monitor real-user Core Web Vitals and catch regressions during experiments.
          </p>
        </div>
        <Button onClick={fetchGlobalStats} variant="secondary" style={{ padding: "8px 14px" }}>
          <RefreshCw size={15} style={{ marginRight: 8 }} className={loading ? "ui-spin" : ""} />
          Refresh Metrics
        </Button>
      </header>

      {/* Global Averages */}
      <div className="stack" style={{ gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={18} color="var(--color-accent)" />
            <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Field data</h2>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-dim)" }}>{globalStats?.count || 0} recorded measurements</span>
        </div>

        {loading && !globalStats ? (
          <Loader label="Aggregating performance telemetry..." />
        ) : (
          <div className="grid">
            <VitalCard 
              label="LCP" 
              name="Largest Contentful Paint"
              value={globalStats?.LCP} 
              description="Measures render speed of main content." 
              target="< 2.5s is Good"
              unit="ms"
              thresholds={{ good: 2500, poor: 4000 }}
            />
            <VitalCard 
              label="INP" 
              name="Interaction to Next Paint"
              value={globalStats?.INP} 
              description="Measures UI responsiveness to user clicks." 
              target="< 200ms is Good"
              unit="ms"
              thresholds={{ good: 200, poor: 500 }}
            />
            <VitalCard 
              label="CLS" 
              name="Cumulative Layout Shift"
              value={globalStats?.CLS} 
              description="Measures visual page stability." 
              target="< 0.1 is Good"
              unit=""
              thresholds={{ good: 0.1, poor: 0.25 }}
            />
          </div>
        )}
      </div>

      {/* Real-Time Session Vitals */}
      <div className="stack" style={{ gap: 16, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Monitor size={18} color="var(--color-accent)" />
            <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Current browser session</h2>
          </div>
          <span style={{ fontSize: "0.8rem", color: hasSessionMeasurement ? "var(--color-success)" : "var(--color-text-dim)" }}>{hasSessionMeasurement ? "● Measuring this session" : "Waiting for browser measurements"}</span>
        </div>

        <div className="grid">
          <VitalCard 
            label="LCP" 
            name="Session Render Speed"
            value={sessionVitals.LCP} 
            description="Your current page load measurement." 
            target="Goal: < 2500ms"
            unit="ms"
            thresholds={{ good: 2500, poor: 4000 }}
          />
          <VitalCard 
            label="INP" 
            name="Session Input Lag"
            value={sessionVitals.INP} 
            description="Your current interaction responsiveness." 
            target="Goal: < 200ms"
            unit="ms"
            thresholds={{ good: 200, poor: 500 }}
          />
          <VitalCard 
            label="CLS" 
            name="Session Layout Stability"
            value={sessionVitals.CLS} 
            description="Your current visual stability score." 
            target="Goal: < 0.1"
            unit=""
            thresholds={{ good: 0.1, poor: 0.25 }}
          />
        </div>
      </div>
    </div>
  );
}

function VitalCard({ 
  label, 
  name,
  value, 
  description, 
  target,
  unit, 
  thresholds 
}: { 
  label: string; 
  name: string;
  value: number | null | undefined; 
  description: string; 
  target: string;
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
    <Card style={{ padding: "var(--space-6)", position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.05em" }}>{label}</span>
        {status ? (
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        ) : (
          <Badge variant="neutral">Collecting</Badge>
        )}
      </div>

      <h4 style={{ fontSize: "0.95rem", color: "var(--color-text)", fontWeight: 600 }}>{name}</h4>
      
      <p style={{ fontSize: "2.2rem", fontWeight: 800, margin: "8px 0 4px 0", color: status ? `var(--color-${status.variant})` : "var(--color-text-dim)" }}>
        {value !== null && value !== undefined ? value : "—"}<span style={{ fontSize: "0.9rem", fontWeight: 500, marginLeft: 4 }}>{value !== null && value !== undefined ? unit : ""}</span>
      </p>

      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>{description}</p>
      
      <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--color-border)", fontSize: "0.75rem", color: "var(--color-text-dim)" }}>
        {target}
      </div>
    </Card>
  );
}
