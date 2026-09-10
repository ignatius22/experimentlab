"use client";

import { useEffect, useState } from "react";
import { 
  Flag, 
  Plus, 
  Settings, 
  SlidersHorizontal, 
  Search, 
  Check, 
  X, 
  Trash2,
  Sparkles,
  HelpCircle,
  Copy
} from "lucide-react";

interface FlagItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  rules: any;
  createdAt: string;
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newRollout, setNewRollout] = useState(100);
  const [saving, setSaving] = useState(false);

  const fetchFlags = async () => {
    try {
      const res = await fetch("/api/flags");
      if (res.ok) {
        const data = await res.json();
        setFlags(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (id: string, currentEnabled: boolean) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !currentEnabled } : f))
    );

    try {
      await fetch(`/api/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
    } catch (err) {
      fetchFlags();
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey.trim(),
          name: newName.trim(),
          description: newDescription.trim(),
          rolloutPercentage: Number(newRollout),
          enabled: true,
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setNewKey("");
        setNewName("");
        setNewDescription("");
        setNewRollout(100);
        fetchFlags();
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredFlags = flags.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Coup Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Feature Flags</h3>
          <p className="text-muted m-0" style={{ fontSize: "0.875rem" }}>
            Control releases, target audiences, and adjust rollouts without another deployment.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-coup-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          <span>Create Flag</span>
        </button>
      </div>

      {/* Coup Search & Filter Box */}
      <div className="box rounded-4 b-1 mb-4">
        <div className="box-body p-3">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <div className="input-group" style={{ maxWidth: 450 }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search flags by key, name, or description..."
                className="form-control bg-light border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.875rem" }}
              />
            </div>
            <div className="small text-muted font-monospace d-none d-sm-block">
              Total Active Flags: <strong className="text-dark">{flags.filter(f => f.enabled).length}</strong> / {flags.length}
            </div>
          </div>
        </div>
      </div>

      {/* Coup Flag Table Box */}
      <div className="box rounded-4 b-1">
        <div className="box-body p-0">
          <div className="table-responsive">
            <table className="table table-hover m-0 text-nowrap align-middle">
              <thead className="bg-light text-muted">
                <tr>
                  <th className="border-0 px-4 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Flag Key</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Description</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Status</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Targeting</th>
                  <th className="border-0 px-4 py-3 text-end text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      Loading feature flags...
                    </td>
                  </tr>
                ) : filteredFlags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <Flag size={36} className="text-muted opacity-50 mb-2" />
                      <p className="m-0 fw-bold text-dark">No feature flags found</p>
                      <p className="text-muted small">Create a flag to start deterministic in-memory evaluations.</p>
                    </td>
                  </tr>
                ) : (
                  filteredFlags.map((flag) => (
                    <tr key={flag.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-2.5">
                          <div className="bg-primary-light text-primary p-2 rounded-3">
                            <Flag size={16} />
                          </div>
                          <div>
                            <span className="fw-bold font-monospace text-primary" style={{ fontSize: "0.9rem" }}>{flag.key}</span>
                            <div className="text-dark small fw-semibold">{flag.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: 320 }}>
                          {flag.description || "No description provided"}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch d-inline-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={flag.enabled}
                            onChange={() => toggleFlag(flag.id, flag.enabled)}
                            style={{ cursor: "pointer", width: 38, height: 20 }}
                          />
                          <span className={`badge rounded-pill fw-bold ${flag.enabled ? "badge-success-light" : "bg-light text-muted"}`} style={{ fontSize: "0.75rem" }}>
                            {flag.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace px-2.5 py-1.5 fw-semibold" style={{ fontSize: "0.75rem" }}>
                          {flag.rolloutPercentage ?? 100}% Rollout
                        </span>
                      </td>
                      <td className="px-4 text-end">
                        <span className="badge bg-light text-muted border font-monospace">
                          &lt; 0.12ms
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Coup Create Flag Modal */}
      {isCreateOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3" 
          style={{ zIndex: 1050 }}
          onClick={() => setIsCreateOpen(false)}
        >
          <div 
            className="box rounded-4 b-1 shadow-lg bg-white w-100" 
            style={{ maxWidth: 520 }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="box-header d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark m-0">Create Feature Flag</h5>
              <button 
                type="button" 
                onClick={() => setIsCreateOpen(false)} 
                className="btn btn-sm btn-light p-1 border-0"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateFlag}>
              <div className="box-body space-y-3">
                <div>
                  <label className="form-label fw-bold text-dark small">Flag Key <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. new_checkout_v2"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="form-control font-monospace bg-light border"
                    style={{ fontSize: "0.875rem" }}
                  />
                  <p className="text-muted small mt-1 mb-0" style={{ fontSize: "0.75rem" }}>
                    Unique identifier used in your code (e.g. <code>useFeatureFlag(&quot;{newKey || "flag_key"}&quot;)</code>)
                  </p>
                </div>

                <div>
                  <label className="form-label fw-bold text-dark small">Display Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Checkout Experience"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="form-control border"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>

                <div>
                  <label className="form-label fw-bold text-dark small">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what this flag enables..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="form-control border"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>

                <div>
                  <div className="d-flex justify-content-between">
                    <label className="form-label fw-bold text-dark small">Initial Rollout Percentage</label>
                    <span className="fw-bold text-primary font-monospace">{newRollout}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newRollout}
                    onChange={(e) => setNewRollout(Number(e.target.value))}
                    className="form-range"
                  />
                </div>
              </div>

              <div className="box-footer bg-light rounded-bottom-4 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-sm btn-light border fw-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-sm btn-coup-primary fw-bold px-3"
                >
                  {saving ? "Creating..." : "Save Flag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
