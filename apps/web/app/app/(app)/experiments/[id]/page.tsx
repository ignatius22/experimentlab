"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExperiment } from "@experiment/sdk-react";
import { fetchExperiments } from "../../../../../lib/apiClient";
import type { Experiment } from "@experiment/schemas";
import type { StatsResult } from "../../../../../lib/stats";
import { Button, Badge, Card, Table, THead, TBody, TR, TH, TD } from "@experiment/ui";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Trophy, 
  Settings, 
  Activity, 
  Target, 
  Clock,
  Info
} from "lucide-react";

interface ExperimentResults {
  primaryMetric: string;
  results: Record<string, StatsResult>;
}

export default function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [results, setResults] = useState<ExperimentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);

  const loadData = async (experimentId: string) => {
    const [exp, res] = await Promise.all([
      fetchExperiments().then((items) => items.find((item) => item.id === experimentId) ?? null),
      fetch(`/api/experiments/${experimentId}/results`).then((res) => res.ok ? res.json() : null)
    ]);
    setExperiment(exp);
    setResults(res);
    setLoading(false);
  };

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      loadData(p.id);
    });
  }, [params]);

  const updateStatus = async (newStatus: string) => {
    if (!id) return;
    setActionPending(true);
    try {
      await fetch(`/api/experiments/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      await loadData(id);
    } finally {
      setActionPending(false);
    }
  };

  const promoteWinner = async (variantId: string) => {
    if (!id || !confirm("Promote this variant to 100% of users and complete the experiment?")) return;
    setActionPending(true);
    try {
      await fetch(`/api/experiments/${id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId })
      });
      await loadData(id);
    } finally {
      setActionPending(false);
    }
  };

  const assignment = useExperiment(experiment?.key ?? "");

  if (loading) return <p>Loading experiment details...</p>;
  if (!experiment) return <p>Experiment not found.</p>;

  const isDraft = experiment.status === "draft";
  const isRunning = experiment.status === "active";
  const isPaused = experiment.status === "paused";
  const isCompleted = experiment.status === "completed";

  return (
    <section className="stack" style={{ gap: "var(--space-8)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="stack" style={{ gap: "var(--space-2)" }}>
          <div>
            <Link href="/app/experiments" className="ui-sidebar-link" style={{ padding: 0, color: "var(--color-text-dim)", background: "transparent", fontSize: "0.9rem" }}>
              <ArrowLeft size={16} style={{ marginRight: 8 }} />
              Back to Experiments
            </Link>
          </div>
          <h1 style={{ fontSize: "2.2rem", marginTop: 8 }}>{experiment.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <code className="ui-badge ui-badge-neutral" style={{ padding: "4px 8px", borderRadius: 4, fontFamily: "monospace" }}>{experiment.key}</code>
            {isRunning && <Badge variant="success">Live</Badge>}
            {isPaused && <Badge variant="warning">Paused</Badge>}
            {isDraft && <Badge variant="neutral">Draft</Badge>}
            {isCompleted && <Badge variant="success">Winner Declared</Badge>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {isDraft && (
            <Button onClick={() => updateStatus("active")} disabled={actionPending}>
              <Play size={16} style={{ marginRight: 8 }} />
              Start Experiment
            </Button>
          )}
          {isRunning && (
            <Button variant="warning" onClick={() => updateStatus("paused")} disabled={actionPending}>
              <Pause size={16} style={{ marginRight: 8 }} />
              Pause
            </Button>
          )}
          {isPaused && (
            <Button onClick={() => updateStatus("active")} disabled={actionPending}>
              <Play size={16} style={{ marginRight: 8 }} />
              Resume
            </Button>
          )}
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="stack" style={{ gap: "var(--space-6)" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "var(--space-4)" }}>
              <Activity size={20} color="var(--color-accent)" />
              <h3>Performance (Metric: {results?.primaryMetric})</h3>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Variant</TH>
                  <TH>Exposures</TH>
                  <TH>Conversions</TH>
                  <TH>Conv. Rate</TH>
                  <TH>Uplift</TH>
                  <TH></TH>
                </TR>
              </THead>
              <TBody>
                {experiment.variants.map((variant) => {
                  const stats = results?.results[variant.id];
                  const isControl = variant.id === experiment.variants[0].id;
                  const isWinner = experiment.winningVariantId === variant.id;
                  
                  return (
                    <TR key={variant.id}>
                      <TD>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{variant.name}</span>
                          {isControl && <Badge variant="neutral" style={{ fontSize: "0.6rem" }}>CONTROL</Badge>}
                          {isWinner && (
                            <Badge variant="success">
                              <Trophy size={12} style={{ marginRight: 4 }} />
                              WINNER
                            </Badge>
                          )}
                        </div>
                      </TD>
                      <TD>{stats?.exposures ?? 0}</TD>
                      <TD>{stats?.conversions ?? 0}</TD>
                      <TD>{stats ? (stats.rate * 100).toFixed(2) : "0.00"}%</TD>
                      <TD>
                        {stats?.uplift !== null && stats?.uplift !== undefined ? (
                          <span style={{ color: stats.uplift > 0 ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600 }}>
                            {stats.uplift > 0 ? "+" : ""}{(stats.uplift * 100).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </TD>
                      <TD>
                        {!isControl && !isCompleted && isRunning && stats && stats.isSignificant && (
                          <Button 
                            onClick={() => promoteWinner(variant.id)} 
                            disabled={actionPending}
                            variant="accent"
                            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                          >
                            Promote
                          </Button>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "var(--space-4)" }}>
              <Target size={20} color="var(--color-accent)" />
              <h3>Targeting Rules</h3>
            </div>
            <div className="stack" style={{ gap: 12 }}>
              {(!experiment.rules || (experiment.rules as any[]).length === 0) ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)" }}>
                  <Info size={16} color="var(--color-text-dim)" />
                  <p style={{ color: "var(--color-text-dim)", fontSize: "0.9rem", margin: 0 }}>No rules defined. This experiment applies to all users.</p>
                </div>
              ) : (
                (experiment.rules as any[]).map((rule, idx) => (
                  <div key={idx} className="ui-tr" style={{ 
                    padding: "10px 14px", 
                    background: "var(--color-bg)", 
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    gap: 8,
                    fontSize: "0.9rem",
                    border: "1px solid var(--color-border)"
                  }}>
                    <strong style={{ color: "var(--color-accent)" }}>{rule.attribute}</strong>
                    <span style={{ color: "var(--color-text-dim)" }}>{rule.operator}</span>
                    <span style={{ fontWeight: 500 }}>{JSON.stringify(rule.value)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <aside className="stack">
          <Card variant="accent">
            <h4 style={{ color: "var(--color-accent)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Your Assignment</h4>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
              <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>{assignment?.name ?? "Excluded"}</p>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 8 }}>
               Your unique ID was bucketed into this variant based on current rules.
            </p>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Settings size={16} color="var(--color-text-dim)" />
              <h4 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Configuration</h4>
            </div>
            <div className="stack" style={{ gap: 16 }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Traffic Rollout</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                   <div style={{ flex: 1, height: 8, background: "var(--color-bg)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${experiment.rollout}%`, background: "var(--color-accent)" }} />
                   </div>
                   <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{experiment.rollout}%</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Variant Allocation</label>
                <div className="stack" style={{ gap: 8, marginTop: 8 }}>
                  {experiment.variants.map(v => (
                    <div key={v.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", paddingBottom: 4, borderBottom: "1px solid var(--color-bg)" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>{v.name}</span>
                      <span style={{ fontWeight: 600 }}>{v.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-dim)", fontSize: "0.75rem", marginTop: 8 }}>
                 <Clock size={12} />
                 Created {new Date(experiment.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}

