"use client";

import { useSyncExternalStore } from "react";
import { useFlag, useExperiment, useTrack } from "@experiment/sdk-react";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";
import { getEvents, subscribeEvents } from "../../../../lib/analytics";
import { Button, Card } from "@experiment/ui";

export default function ProofPage() {
  const vitals = useSyncExternalStore(subscribeVitals, getVitals, getVitals);
  const events = useSyncExternalStore(subscribeEvents, getEvents, getEvents);
  const track = useTrack();
  
  // Using SDK Hooks
  const isNewNavEnabled = useFlag("new_nav");
  const isQuickCreateEnabled = useFlag("quick_create");
  const heroVariant = useExperiment("homepage_headline");

  return (
    <section className="stack" style={{ gap: "var(--space-8)" }}>
      <header>
        <h1 style={{ fontSize: "1.8rem" }}>Proof Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)" }}>Developer validation tool for SDK and event ingestion.</p>
      </header>
      
      <div className="grid">
        <Card style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--color-accent)", textTransform: "uppercase" }}>SDK Evaluation</h3>
          <div className="stack" style={{ gap: 12, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>new_nav flag:</span>
              <span className={isNewNavEnabled ? "badge badge-success" : "badge badge-neutral"}>{String(isNewNavEnabled)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>quick_create flag:</span>
              <span className={isQuickCreateEnabled ? "badge badge-success" : "badge badge-neutral"}>{String(isQuickCreateEnabled)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Assigned Variant:</span>
              <span style={{ fontWeight: 600 }}>{heroVariant?.name ?? "None"}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3>Test Events</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "12px 0 20px" }}>
            Trigger conversions manually to verify statistical calculations.
          </p>
          <Button onClick={() => track("signup_rate")} style={{ width: "100%" }}>
            Track &quot;signup_rate&quot;
          </Button>
        </Card>

        <Card>
          <h3>Live Vitals</h3>
          <div className="stack" style={{ gap: 8, marginTop: 16 }}>
            <p style={{ fontSize: "0.9rem" }}>LCP: <strong>{vitals.LCP ?? "—"}</strong></p>
            <p style={{ fontSize: "0.9rem" }}>INP: <strong>{vitals.INP ?? "—"}</strong></p>
            <p style={{ fontSize: "0.9rem" }}>CLS: <strong>{vitals.CLS ?? "—"}</strong></p>
          </div>
        </Card>
      </div>

      <Card>
        <h3>Recent Events (Memory)</h3>
        <div className="stack" style={{ gap: 4, marginTop: 16 }}>
          {events.slice(0, 10).map((event) => (
            <div key={event.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)", fontSize: "0.85rem" }}>
              <span style={{ fontWeight: 500 }}>{event.type.toUpperCase()}</span>
              <span style={{ color: "var(--color-text-dim)" }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          {events.length === 0 && <p style={{ color: "var(--color-text-dim)" }}>No events yet.</p>}
        </div>
      </Card>
    </section>
  );
}

