"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { listExperiments } from "../../../../../lib/apiClient";
import { getAssignedVariant } from "../../../../../lib/experiments";

export default function ExperimentDetailPage() {
  const params = useParams<{ id: string }>();
  const experiment = useMemo(() => listExperiments().find((item) => item.id === params.id), [params.id]);

  if (!experiment) {
    return <p>Experiment not found.</p>;
  }

  const assignment = getAssignedVariant("demo-user-001", experiment);

  return (
    <section className="stack">
      <h2>{experiment.name}</h2>
      <p>Status: {experiment.status}</p>
      <p>Rollout: {experiment.rollout}%</p>
      <p>Assigned variant: {assignment.name}</p>
      <div className="grid">
        {experiment.variants.map((variant) => (
          <article key={variant.id} style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
            <h3>{variant.name}</h3>
            <p>Weight: {variant.weight}%</p>
          </article>
        ))}
      </div>
    </section>
  );
}

