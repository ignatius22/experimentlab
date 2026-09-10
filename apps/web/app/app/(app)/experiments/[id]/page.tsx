"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  FlaskConical, 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle2, 
  Trophy, 
  Target, 
  Clock, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Percent, 
  Users, 
  Sparkles,
  SlidersHorizontal
} from "lucide-react";

interface VariantMetric {
  variantId: string;
  variantName: string;
  weight: number;
  exposures: number;
  conversions: number;
  conversionRate: number;
  upliftVsControl: number;
  standardError: number;
  zScore: number;
  pValue: number;
  isSignificant: boolean;
  isWinner: boolean;
}

export default function ExperimentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [experiment, setExperiment] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<VariantMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const fetchExperiment = async () => {
    try {
      const res = await fetch(`/api/experiments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setExperiment(data.experiment);
        setMetrics(data.metrics || []);
        setLoadError(null);
      } else if (res.status === 404) {
        setLoadError("This experiment no longer exists or the link is out of date.");
      } else {
        setLoadError("We could not load this experiment. Please try again.");
      }
    } catch {
      setLoadError("We could not load this experiment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiment();
  }, [id]);

  const updateStatus = async (status: string) => {
    setActionPending(true);
    try {
      await fetch(`/api/experiments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchExperiment();
    } finally {
      setActionPending(false);
    }
  };

  const declareWinner = async (variantId: string) => {
    setActionPending(true);
    try {
      await fetch(`/api/experiments/${id}/winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winningVariantId: variantId }),
      });
      fetchExperiment();
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Loading experiment telemetry and significance calculations...
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="box rounded-4 b-1 text-center py-5">
        <h5 className="fw-semibold text-dark">Experiment not found</h5>
        <p className="text-muted small mt-2 mb-0">{loadError || "This experiment is not available in your workspace."}</p>
        <Link href="/app/experiments" className="btn btn-sm btn-coup-primary mt-3">
          Return to Experiments
        </Link>
      </div>
    );
  }

  const isRunning = experiment.status?.toLowerCase() === "running" || experiment.status?.toLowerCase() === "active";
  const isCompleted = experiment.status?.toLowerCase() === "completed";

  return (
    <div>
      {/* Back Link & Header */}
      <div className="mb-4">
        <Link href="/app/experiments" className="text-muted text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1 mb-2">
          <ArrowLeft size={14} />
          <span>Back to Experiments Hub</span>
        </Link>
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary-light text-primary fw-bold font-monospace">
                {experiment.key}
              </span>
              <span className={`badge rounded-pill fw-bold ${isRunning ? "badge-success-light" : isCompleted ? "badge-primary-light" : "badge-warning-light"}`}>
                {experiment.status?.toUpperCase() || "DRAFT"}
              </span>
            </div>
            <h3 className="fw-bold text-dark m-0">{experiment.name}</h3>
          </div>

          <div className="d-flex align-items-center gap-2">
            {isRunning ? (
              <button
                onClick={() => updateStatus("paused")}
                disabled={actionPending}
                className="btn btn-sm btn-light border text-danger fw-semibold d-flex align-items-center gap-1.5"
              >
                <Pause size={14} />
                <span>Pause Test</span>
              </button>
            ) : (
              <button
                onClick={() => updateStatus("running")}
                disabled={actionPending || isCompleted}
                className="btn btn-sm btn-coup-primary fw-bold d-flex align-items-center gap-1.5"
              >
                <Play size={14} />
                <span>Resume / Start</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Variants & Statistical Significance Table in Coup Box */}
      <div className="box rounded-4 b-1 mb-4 shadow-sm">
        <div className="box-header no-border pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark m-0">Variant Performance &amp; Frequentist Z-Score Metrics</h5>
          <span className="badge bg-success-light text-success fw-bold">95% Confidence (Two-Tailed)</span>
        </div>
        <div className="box-body px-0 pb-0">
          <div className="table-responsive">
            <table className="table table-hover m-0 text-nowrap align-middle">
              <thead className="bg-light text-muted">
                <tr>
                  <th className="border-0 px-4 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Variant</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Traffic Split</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Exposures</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Conversions</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Conversion Rate</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Uplift vs Control</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>P-Value (Z)</th>
                  <th className="border-0 px-4 py-3 text-end text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Winner</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, idx) => (
                  <tr key={m.variantId || idx}>
                    <td className="px-4">
                      <div className="fw-bold text-dark">{m.variantName}</div>
                      <div className="text-muted small font-monospace">{m.variantId}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">
                        {m.weight}%
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark font-monospace">
                        {m.exposures.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-success font-monospace">
                        {m.conversions.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-primary font-monospace" style={{ fontSize: "0.95rem" }}>
                        {(m.conversionRate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span className={`fw-bold font-monospace ${m.upliftVsControl >= 0 ? "text-success" : "text-danger"}`}>
                        {m.upliftVsControl > 0 ? `+${(m.upliftVsControl * 100).toFixed(2)}%` : `${(m.upliftVsControl * 100).toFixed(2)}%`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill fw-bold ${m.pValue < 0.05 ? "badge-success-light" : "bg-light text-muted"}`}>
                        p = {m.pValue.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 text-end">
                      {m.isWinner ? (
                        <span className="badge badge-success-light rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1">
                          <Trophy size={13} /> Winner
                        </span>
                      ) : (
                        <button
                          onClick={() => declareWinner(m.variantId)}
                          disabled={actionPending || isCompleted}
                          className="btn btn-sm btn-light border text-primary fw-semibold px-2.5 py-1"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Promote 100%
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Targeting Rules & Rollout Details in Coup Grid */}
      <div className="row g-4">
        <div className="col-lg-8 col-12">
          <div className="box rounded-4 b-1 h-100">
            <div className="box-header b-0 pb-0 d-flex align-items-center gap-2">
              <Target size={18} className="text-primary" />
              <h5 className="fw-bold text-dark m-0">Audience Targeting Rules</h5>
            </div>
            <div className="box-body">
              {(!experiment.rules || (experiment.rules as any[]).length === 0) ? (
                <div className="p-3 bg-light rounded-3 border text-muted small">
                  No custom targeting rules set. This experiment is evaluated across 100% of eligible incoming traffic.
                </div>
              ) : (
                <div className="space-y-2">
                  {(experiment.rules as any[]).map((rule, idx) => (
                    <div key={idx} className="p-2.5 bg-light rounded-3 border d-flex align-items-center gap-2 small">
                      <span className="badge bg-primary-light text-primary font-monospace">{rule.attribute}</span>
                      <span className="text-muted">{rule.operator}</span>
                      <strong className="text-dark font-monospace">{JSON.stringify(rule.value)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-12">
          <div className="box rounded-4 b-1 h-100">
            <div className="box-header b-0 pb-0 d-flex align-items-center gap-2">
              <SlidersHorizontal size={18} className="text-primary" />
              <h5 className="fw-bold text-dark m-0">Traffic Allocation</h5>
            </div>
            <div className="box-body">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-dark">Total Rollout</span>
                <span className="text-primary font-monospace">{experiment.rollout || 100}%</span>
              </div>
              <div className="progress mb-3" style={{ height: 8 }}>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${experiment.rollout || 100}%` }}></div>
              </div>

              <div className="small text-muted border-top pt-2 mt-2">
                <div>Created: <strong className="text-dark">{new Date(experiment.createdAt).toLocaleDateString()}</strong></div>
                <div>Hash Engine: <strong className="text-dark">32-Bit FNV-1a</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
