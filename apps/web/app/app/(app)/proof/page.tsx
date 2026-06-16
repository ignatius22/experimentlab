"use client";

import { useSyncExternalStore, useState } from "react";
import { useFlag, useExperiment, useTrack, useManifest } from "@experiment/sdk-react";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";
import { getEvents, subscribeEvents } from "../../../../lib/analytics";
import { Button, Card, Badge, Loader } from "@experiment/ui";
import { Activity, Beaker, CheckCircle2, XCircle, Zap } from "lucide-react";

export default function ProofPage() {
  const vitals = useSyncExternalStore(subscribeVitals, getVitals, getVitals);
  const events = useSyncExternalStore(subscribeEvents, getEvents, getEvents);
  const { manifest, loading } = useManifest();
  const track = useTrack();
  
  const [activeExperimentKey, setActiveExperimentKey] = useState<string | null>(null);

  // Extract all unique metrics from the manifest for the tracking tool
  const allMetrics = Array.from(new Set(
    manifest?.experiments.flatMap(exp => exp.metrics || []) || []
  ));

  if (loading && !manifest) {
    return <Loader label="Initializing SDK manifest..." />;
  }

  if (!manifest) {
    return (
      <div style={{ textAlign: "center", padding: "48px", color: "var(--color-danger)" }}>
        <h2>Failed to load SDK Manifest</h2>
        <p>There was an error fetching your feature flags. Please check your network connection or try refreshing the page.</p>
      </div>
    );
  }

  return (
    <section className="stack" style={{ gap: "var(--space-8)" }}>
      <header>
        <h1 style={{ fontSize: "1.8rem" }}>Proof Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)" }}>Developer validation tool for SDK and event ingestion.</p>
      </header>
      
      <div className="grid">
        {/* 1. Dynamic Feature Flags Evaluation */}
        <Card style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Zap size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "0.9rem", color: "var(--color-accent)", textTransform: "uppercase" }}>Feature Flags Evaluation</h3>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {manifest?.flags.map(flag => (
              <FlagRow key={flag.key} flagKey={flag.key} />
            ))}
            {(!manifest || manifest.flags.length === 0) && (
              <p style={{ color: "var(--color-text-dim)", fontSize: "0.9rem" }}>No flags found in manifest.</p>
            )}
          </div>
        </Card>

        {/* 2. Dynamic Experiment Evaluation */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Beaker size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase" }}>Experiment Evaluation</h3>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            <select 
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--color-border)", background: "transparent", color: "inherit" }}
              onChange={(e) => setActiveExperimentKey(e.target.value)}
              value={activeExperimentKey || ""}
            >
              <option value="">Select an experiment...</option>
              {manifest?.experiments.map(exp => (
                <option key={exp.key} value={exp.key}>{exp.key}</option>
              ))}
            </select>
            
            {activeExperimentKey && (
              <ExperimentEvaluation key={activeExperimentKey} experimentKey={activeExperimentKey} />
            )}
          </div>
        </Card>

        {/* 3. Live Vitals Card */}
        <Card>
           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Activity size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase" }}>Live Vitals</h3>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <p style={{ fontSize: "0.9rem" }}>LCP: <strong>{vitals.LCP ?? "—"}</strong></p>
            <p style={{ fontSize: "0.9rem" }}>INP: <strong>{vitals.INP ?? "—"}</strong></p>
            <p style={{ fontSize: "0.9rem" }}>CLS: <strong>{vitals.CLS ?? "—"}</strong></p>
          </div>
        </Card>
      </div>

      <div className="grid">
        {/* 4. Test Events Card */}
        <Card>
          <h3>Trigger Test Events</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "12px 0 20px" }}>
            Manually trigger custom metrics to verify uplift calculations.
          </p>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
            {allMetrics.map(metric => (
              <Button key={metric} onClick={() => track(metric)} style={{ fontSize: "0.8rem" }}>
                Track {metric}
              </Button>
            ))}
            {allMetrics.length === 0 && (
              <p style={{ color: "var(--color-text-dim)", fontSize: "0.8rem" }}>No metrics defined in experiments.</p>
            )}
          </div>
        </Card>

        {/* 5. Recent Events Card */}
        <Card>
          <h3>Recent SDK Events</h3>
          <div className="stack" style={{ gap: 4, marginTop: 16 }}>
            {events.slice(0, 10).map((event) => (
              <div key={event.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 500 }}>{event.type.toUpperCase()}</span>
                <span style={{ color: "var(--color-text-dim)" }}>
                  {(event.payload.name as string) || (event.payload.experimentKey as string) || ""} 
                  {event.payload.variant ? ` (${event.payload.variant})` : ""}
                </span>
                <span style={{ color: "var(--color-text-dim)" }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
            {events.length === 0 && <p style={{ color: "var(--color-text-dim)" }}>No events emitted yet.</p>}
          </div>
        </Card>
      </div>
    </section>
  );
}

function FlagRow({ flagKey }: { flagKey: string }) {
  const isEnabled = useFlag(flagKey);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <code>{flagKey}</code>
      <Badge variant={isEnabled ? "success" : "neutral"}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isEnabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {isEnabled ? "ON" : "OFF"}
        </div>
      </Badge>
    </div>
  );
}

function ExperimentEvaluation({ experimentKey }: { experimentKey: string }) {
  const variant = useExperiment(experimentKey);
  return (
    <div className="stack" style={{ gap: 8, padding: "12px", background: "var(--color-bg-muted)", borderRadius: "6px" }}>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Current Assignment:</p>
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-accent)" }}>
        {variant ? variant.name : "Not Enrolled / Ineligible"}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-dim)" }}>ID: {variant?.id || "N/A"}</p>
    </div>
  );
}

