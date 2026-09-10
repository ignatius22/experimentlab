"use client";

import { useSyncExternalStore, useState } from "react";
import { useFlag, useExperiment, useTrack, useManifest } from "experimentlab-react";
import { track as localTrack, getEvents, subscribeEvents } from "../../../../lib/analytics";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";
import { Button, Card, Badge, Loader } from "@experiment/ui";
import { Activity, Beaker, CheckCircle2, XCircle, Zap, Send, Sparkles } from "lucide-react";

export default function ProofPage() {
  const vitals = useSyncExternalStore(subscribeVitals, getVitals, getVitals);
  const events = useSyncExternalStore(subscribeEvents, getEvents, getEvents);
  const { manifest, loading } = useManifest();
  const sdkTrack = useTrack();
  
  const [activeExperimentKey, setActiveExperimentKey] = useState<string | null>(null);
  const [lastEmitted, setLastEmitted] = useState<string | null>(null);

  // Extract all unique metrics from the manifest for the tracking tool
  const allMetrics = Array.from(new Set([
    "order_completed",
    "conversion_rate",
    ...(manifest?.experiments.flatMap((exp: any) => exp.metrics || []) || [])
  ]));

  const handleTriggerEvent = (metricName: string) => {
    // 1. Emit via SDK (flushes to DB endpoint)
    sdkTrack(metricName, { source: "proof_sandbox", timestamp: new Date().toISOString() });
    
    // 2. Emit to local in-memory event stream for immediate UI feedback
    localTrack(metricName, { source: "proof_sandbox" });

    setLastEmitted(`Fired "${metricName}" event!`);
    setTimeout(() => setLastEmitted(null), 3000);
  };

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
    <div className="stack" style={{ gap: "var(--space-8)" }}>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: "2rem" }}>SDK sandbox</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Test flag evaluation and event ingestion before connecting your application.
          </p>
        </div>
      </header>
      
      <div className="grid">
        {/* 1. Dynamic Feature Flags Evaluation */}
        <Card style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Zap size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "0.9rem", color: "var(--color-accent)", textTransform: "uppercase", fontWeight: 700 }}>
              Feature Flags Evaluation
            </h3>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {manifest?.flags.map((flag: any) => (
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
            <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", fontWeight: 700 }}>Experiment Evaluation</h3>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            <select 
              style={{ 
                padding: "8px 12px", 
                borderRadius: "var(--radius-sm)", 
                border: "1px solid var(--color-border)", 
                background: "var(--color-bg)", 
                color: "inherit",
                fontSize: "0.9rem" 
              }}
              onChange={(e) => setActiveExperimentKey(e.target.value)}
              value={activeExperimentKey || (manifest?.experiments[0]?.key ?? "")}
            >
              {manifest?.experiments.map((exp: any) => (
                <option key={exp.key} value={exp.key}>{exp.key}</option>
              ))}
            </select>
            
            <ExperimentEvaluation 
              key={activeExperimentKey || manifest?.experiments[0]?.key || "none"} 
              experimentKey={activeExperimentKey || manifest?.experiments[0]?.key || ""} 
            />
          </div>
        </Card>

        {/* 3. Live Vitals Card */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Activity size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", fontWeight: 700 }}>Live Vitals</h3>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>LCP (Render):</span>
              <strong>{vitals.LCP ? `${vitals.LCP} ms` : "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>INP (Latency):</span>
              <strong>{vitals.INP ? `${vitals.INP} ms` : "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>CLS (Stability):</span>
              <strong>{vitals.CLS ? vitals.CLS : "—"}</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid">
        {/* 4. Test Events Card */}
        <Card className="stack" style={{ gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Send size={18} color="var(--color-accent)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Trigger Test Events</h3>
            </div>
            {lastEmitted && (
              <span style={{ fontSize: "0.8rem", color: "var(--color-success)", fontWeight: 600 }}>
                {lastEmitted}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
            Click a metric button below to instantly fire a conversion event through the SDK to the ingestion backend.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            {allMetrics.map(metric => (
              <Button 
                key={metric} 
                onClick={() => handleTriggerEvent(metric)} 
                style={{ padding: "8px 14px", fontSize: "0.85rem" }}
              >
                Track <code>{metric}</code>
              </Button>
            ))}
          </div>
        </Card>

        {/* 5. Recent Events Card */}
        <Card className="stack" style={{ gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color="var(--color-accent)" />
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Recent SDK Events (Live)</h3>
          </div>
          <div className="stack" style={{ gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {events.slice(0, 10).map((event) => (
              <div 
                key={event.id} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  padding: "6px 8px", 
                  background: "var(--color-bg)", 
                  borderRadius: "var(--radius-sm)", 
                  fontSize: "0.8rem",
                  border: "1px solid var(--color-border)"
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>{event.type.toUpperCase()}</span>
                <span style={{ color: "var(--color-text)" }}>
                  {String(event.payload.name || event.payload.experimentKey || "event")}
                </span>
                <span style={{ color: "var(--color-text-dim)", fontSize: "0.75rem" }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <p style={{ color: "var(--color-text-dim)", fontSize: "0.85rem", margin: "12px 0" }}>
                No events emitted in this session yet. Click a track button on the left!
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FlagRow({ flagKey }: { flagKey: string }) {
  const isEnabled = useFlag(flagKey);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
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
    <div className="stack" style={{ gap: 6, padding: "12px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Calculated Assignment:</span>
      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-accent)" }}>
        {variant ? variant.name : "Not Enrolled / Ineligible"}
      </div>
      <span style={{ fontSize: "0.75rem", color: "var(--color-text-dim)" }}>Variant ID: <code>{variant?.id || "N/A"}</code></span>
    </div>
  );
}
