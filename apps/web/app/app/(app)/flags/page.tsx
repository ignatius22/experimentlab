"use client";

import { useEffect, useState } from "react";
import { useFlag } from "@experiment/sdk-react";
import type { FeatureFlag, Rule } from "@experiment/schemas";
import { Button, Table, THead, TBody, TR, TH, TD, Switch, Modal, Input, Badge, Loader } from "@experiment/ui";
import { Plus, Flag, Search, CheckCircle2, XCircle, Target, Edit2, Trash2 } from "lucide-react";

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rules Modal State
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [activeFlagKey, setActiveFlagKey] = useState<string | null>(null);
  const [editingRules, setEditingRules] = useState<Rule[]>([]);

  const loadFlags = async () => {
    const res = await fetch("/api/flags");
    if (res.ok) setFlags(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const toggleFlag = async (key: string, current: boolean) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !current } : f));
    await fetch(`/api/flags/${encodeURIComponent(key)}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !current })
    });
  };

  const onCreate = async () => {
    if (!newKey) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey, description: newDesc })
      });
      if (res.ok) {
        await loadFlags();
        setIsModalOpen(false);
        setNewKey("");
        setNewDesc("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create flag");
      }
    } finally {
      setPending(false);
    }
  };

  const openRulesModal = (flag: FeatureFlag) => {
    setActiveFlagKey(flag.key);
    setEditingRules((flag.rules as Rule[]) || []);
    setIsRulesModalOpen(true);
  };

  const saveRules = async () => {
    if (!activeFlagKey) return;
    setPending(true);
    try {
      await fetch(`/api/flags/${encodeURIComponent(activeFlagKey)}/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: editingRules })
      });
      setIsRulesModalOpen(false);
      await loadFlags();
    } finally {
      setPending(false);
    }
  };

  if (loading) return <Loader label="Loading feature flags..." />;

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>Feature Flags</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Control feature availability across your application.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} style={{ marginRight: 8 }} />
          Create Flag
        </Button>
      </header>

      <div className="ui-table-container">
        <Table>
          <THead>
            <TR>
              <TH>Flag Key</TH>
              <TH>Description</TH>
              <TH>Status</TH>
              <TH>Targeting</TH>
              <TH>Your Evaluation</TH>
            </TR>
          </THead>
          <TBody>
            {flags.map((flag) => (
              <TR key={flag.key}>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Flag size={16} color="var(--color-text-dim)" />
                    <code>{flag.key}</code>
                  </div>
                </TD>
                <TD style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{flag.description || "—"}</TD>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Switch 
                      checked={flag.enabled} 
                      onChange={() => toggleFlag(flag.key, flag.enabled)} 
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </TD>
                <TD>
                  <Button variant="secondary" onClick={() => openRulesModal(flag)} style={{ padding: "4px 8px", fontSize: "0.8rem" }}>
                    <Target size={14} style={{ marginRight: 6 }} />
                    {Array.isArray(flag.rules) ? flag.rules.length : 0} Rules
                  </Button>
                </TD>
                <TD>
                   <LocalEvalCell flagKey={flag.key} />
                </TD>
              </TR>
            ))}
            {flags.length === 0 && (
              <TR>
                <TD colSpan={5} style={{ textAlign: "center", padding: "48px", color: "var(--color-text-dim)" }}>
                  <div className="stack" style={{ alignItems: "center", gap: 8 }}>
                    <Search size={32} />
                    <p>No feature flags found.</p>
                  </div>
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Feature Flag">
        <div className="stack" style={{ marginTop: 16 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Flag Key</label>
          <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. beta_feature" />
          
          <label style={{ fontSize: "0.85rem", fontWeight: 500, marginTop: 8 }}>Description</label>
          <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this flag control?" />
          
          {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>}
          
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <Button 
              style={{ background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={pending}>
              {pending ? "Creating..." : "Create Flag"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rules Modal */}
      <Modal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} title={`Edit Rules: ${activeFlagKey}`}>
        <div className="stack" style={{ marginTop: 16 }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Users must match ALL of these rules to have the flag evaluated as ON.
          </p>
          
          <div className="stack" style={{ gap: 12, marginTop: 16 }}>
            {editingRules.map((rule, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Input 
                  value={rule.attribute} 
                  onChange={e => {
                    const newRules = [...editingRules];
                    newRules[idx].attribute = e.target.value;
                    setEditingRules(newRules);
                  }}
                  placeholder="Attribute (e.g. plan)"
                  style={{ flex: 1, minWidth: "120px" }}
                />
                <select 
                  value={rule.operator}
                  onChange={e => {
                    const newRules = [...editingRules];
                    newRules[idx].operator = e.target.value as any;
                    setEditingRules(newRules);
                  }}
                  className="ui-input"
                  style={{ flex: 1, minWidth: "120px" }}
                >
                  <option value="eq">Equals</option>
                  <option value="neq">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="in">In (comma separated)</option>
                  <option value="nin">Not In</option>
                </select>
                <Input 
                  value={Array.isArray(rule.value) ? rule.value.join(", ") : String(rule.value || "")} 
                  onChange={e => {
                    const newRules = [...editingRules];
                    if (newRules[idx].operator === "in" || newRules[idx].operator === "nin") {
                       newRules[idx].value = e.target.value.split(",").map(s => s.trim());
                    } else {
                       newRules[idx].value = e.target.value;
                    }
                    setEditingRules(newRules);
                  }}
                  placeholder="Value"
                  style={{ flex: 1, minWidth: "120px" }}
                />
                <button 
                  onClick={() => setEditingRules(editingRules.filter((_, i) => i !== idx))}
                  style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: 8 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <Button 
              variant="secondary" 
              onClick={() => setEditingRules([...editingRules, { attribute: "", operator: "eq", value: "" }])}
              style={{ width: "fit-content", marginTop: 8 }}
            >
              <Plus size={16} style={{ marginRight: 8 }} />
              Add Rule
            </Button>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <Button 
              variant="secondary"
              onClick={() => setIsRulesModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveRules} disabled={pending}>
              {pending ? "Saving..." : "Save Rules"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

function LocalEvalCell({ flagKey }: { flagKey: string }) {
  const isEnabled = useFlag(flagKey);
  return (
    <Badge variant={isEnabled ? "success" : "neutral"}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {isEnabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {isEnabled ? "Active for you" : "Off for you"}
      </div>
    </Badge>
  );
}
