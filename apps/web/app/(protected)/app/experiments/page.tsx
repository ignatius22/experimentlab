"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { z } from "zod";
import { createExperiment, listExperiments } from "../../../../lib/apiClient";
import { track } from "../../../../lib/analytics";

const keySchema = z.string().regex(/^[a-z0-9_]+$/i);

export default function ExperimentsPage() {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState(() => listExperiments());

  const optimistic = useMemo(
    () => ({
      id: "optimistic",
      name,
      key,
      status: "draft" as const,
      variants: [{ id: "a", name: "Control", weight: 50 }, { id: "b", name: "Variant", weight: 50 }],
      metrics: ["signup_rate"],
      rollout: 100,
      createdAt: new Date().toISOString()
    }),
    [key, name]
  );

  const onCreate = async () => {
    setError(null);
    if (name.trim().length < 2 || !keySchema.safeParse(key).success) {
      setError("Invalid input. Use alphanumeric key.");
      return;
    }

    const snapshot = items;
    setPending(true);
    setItems([optimistic, ...items]);

    try {
      const created = await createExperiment({ name, key, metrics: ["signup_rate"] });
      setItems([created, ...snapshot]);
      track("experiment_created", { id: created.id, key: created.key });
      setName("");
      setKey("");
    } catch {
      setItems(snapshot);
      setError("Could not create experiment. Retry.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="stack">
      <h2>Experiments</h2>
      <div className="stack" style={{ maxWidth: 520 }}>
        <input aria-label="Experiment name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Checkout hero test" />
        <input aria-label="Experiment key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="checkout_hero_test" />
        <button onClick={onCreate} disabled={pending}>{pending ? "Creating..." : "Create experiment"}</button>
        {error ? <p role="alert" style={{ color: "var(--color-danger)" }}>{error}</p> : null}
      </div>
      <div className="stack">
        {items.map((experiment) => (
          <article key={experiment.id} style={{ background: "var(--color-surface)", padding: 16, borderRadius: 12 }}>
            <strong>{experiment.name}</strong>
            <p>{experiment.key}</p>
            <Link href={`/app/experiments/${experiment.id}`}>Open</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

