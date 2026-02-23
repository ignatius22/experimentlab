"use client";

import { useSyncExternalStore } from "react";
import { getVitals, subscribeVitals } from "../../../../lib/webVitals";
import { getEvents, subscribeEvents } from "../../../../lib/analytics";
import { getDefaultFlags } from "../../../../lib/flags";
import { listExperiments } from "../../../../lib/apiClient";
import { getAssignedVariant } from "../../../../lib/experiments";

export default function ProofPage() {
  const vitals = useSyncExternalStore(subscribeVitals, getVitals, getVitals);
  const events = useSyncExternalStore(subscribeEvents, getEvents, getEvents);
  const flags = getDefaultFlags();
  const assignments = listExperiments().map((experiment) => ({
    key: experiment.key,
    variant: getAssignedVariant("demo-user-001", experiment).name
  }));

  return (
    <section className="stack">
      <h2>Proof Dashboard</h2>
      <div className="grid">
        <article style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
          <h3>Web Vitals</h3>
          <p>LCP: {vitals.LCP ?? "waiting"}</p>
          <p>INP: {vitals.INP ?? "waiting"}</p>
          <p>CLS: {vitals.CLS ?? "waiting"}</p>
        </article>
        <article style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
          <h3>Flags</h3>
          {flags.map((flag) => <p key={flag.key}>{flag.key}: {String(flag.enabled)}</p>)}
        </article>
        <article style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
          <h3>Variant Assignments</h3>
          {assignments.map((assignment) => <p key={assignment.key}>{assignment.key}: {assignment.variant}</p>)}
        </article>
      </div>
      <article style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
        <h3>Live Event Stream</h3>
        {events.slice(0, 10).map((event) => <p key={event.id}>{event.type}</p>)}
      </article>
    </section>
  );
}

