"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { createExperiment, fetchExperiments } from "../../../../lib/apiClient";
import { track } from "../../../../lib/analytics";
import type { Experiment } from "@experiment/schemas";
import { Button, Table, THead, TBody, TR, TH, TD, Badge, Modal, Input, Loader } from "@experiment/ui";
import { Plus, BarChart2, Calendar, MoreHorizontal, ExternalLink, Search } from "lucide-react";

const keySchema = z.string().regex(/^[a-z0-9_]+$/i);

export default function ExperimentsPage() {
  const [items, setItems] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [metric, setMetric] = useState("conversion_rate");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiments().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const onCreate = async () => {
    setError(null);
    if (name.trim().length < 2 || !keySchema.safeParse(key).success || metric.trim().length < 2) {
      setError("Invalid input. Name and Metric > 2 chars, Key alphanumeric.");
      return;
    }

    setPending(true);
    try {
      const created = await createExperiment({ name, key, metrics: [metric] });
      setItems([created, ...items]);
      track("experiment_created", { id: created.id, key: created.key });
      setName("");
      setKey("");
      setMetric("conversion_rate");
      setIsModalOpen(false);
    } catch {
      setError("Could not create experiment. Retry.");
    } finally {
      setPending(false);
    }
  };

  const getStatusBadge = (status: Experiment["status"]) => {
    switch (status) {
      case "active": return <span className="badge badge-success">Running</span>;
      case "draft": return <span className="badge badge-neutral">Draft</span>;
      case "paused": return <span className="badge badge-warning">Paused</span>;
      case "completed": return <span className="badge badge-success" style={{ opacity: 0.8 }}>Completed</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>Experiments</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Manage and monitor your product A/B tests.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} style={{ marginRight: 8 }} />
          Create Experiment
        </Button>
      </header>

      {loading ? (
        <Loader label="Fetching experiments..." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Key</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {items.map((experiment) => (
              <TR key={experiment.id}>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BarChart2 size={18} color="var(--color-text-dim)" />
                    <span style={{ fontWeight: 600 }}>{experiment.name}</span>
                  </div>
                </TD>
                <TD><code>{experiment.key}</code></TD>
                <TD>{getStatusBadge(experiment.status)}</TD>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-dim)", fontSize: "0.85rem" }}>
                    <Calendar size={14} />
                    {new Date(experiment.createdAt).toLocaleDateString()}
                  </div>
                </TD>
                <TD>
                  <Link href={`/app/experiments/${experiment.id}`}>
                    <Button variant="secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                      View Results
                      <ExternalLink size={14} style={{ marginLeft: 8 }} />
                    </Button>
                  </Link>
                </TD>
              </TR>
            ))}
            {items.length === 0 && (
              <TR>
                <TD colSpan={5} style={{ textAlign: "center", padding: "48px", color: "var(--color-text-dim)" }}>
                  <div className="stack" style={{ alignItems: "center", gap: 8 }}>
                    <Search size={32} />
                    <p>No experiments found. Create your first one to get started!</p>
                  </div>
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Experiment">
        <div className="stack" style={{ marginTop: 16 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Experiment Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Homepage Hero Test" />
          
          <label style={{ fontSize: "0.85rem", fontWeight: 500, marginTop: 8 }}>Unique Key</label>
          <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. homepage_hero" />

          <label style={{ fontSize: "0.85rem", fontWeight: 500, marginTop: 8 }}>Target Metric</label>
          <Input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="e.g. conversion_rate" />
          
          {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>}
          
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <Button 
              style={{ background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={pending}>
              {pending ? "Creating..." : "Create Experiment"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
