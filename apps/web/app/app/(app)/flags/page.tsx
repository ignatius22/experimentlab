"use client";

import { useState } from "react";
import { getDefaultFlags, evaluateFlag } from "../../../../lib/flags";

export default function FlagsPage() {
  const [flags, setFlags] = useState(getDefaultFlags());

  return (
    <section className="stack">
      <h2>Feature Flags</h2>
      {flags.map((flag) => (
        <article key={flag.key} style={{ background: "var(--color-surface)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{flag.key}</strong>
              <p>{flag.description}</p>
            </div>
            <button
              onClick={() => {
                setFlags((current) =>
                  current.map((item) => (item.key === flag.key ? { ...item, enabled: !item.enabled } : item))
                );
              }}
            >
              {flag.enabled ? "On" : "Off"}
            </button>
          </div>
          <p>Evaluation for demo-user-001: {evaluateFlag(flag, "demo-user-001") ? "Enabled" : "Disabled"}</p>
        </article>
      ))}
    </section>
  );
}

