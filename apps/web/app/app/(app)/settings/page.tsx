"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Building, 
  Shield, 
  Key, 
  Copy, 
  Check, 
  Save, 
  Plus,
  Trash2,
  AlertCircle,
  X
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  revokedAt: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string; orgName: string; orgId: string; role?: string } | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [orgName, setOrgName] = useState("Core Engineering");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // API Key Management state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState<"client" | "server">("client");
  const [keyError, setKeyError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoadingKeys(true);
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch (e) {
      console.error("Failed to load API keys", e);
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
          setOrgName(data.user.orgName || "Core Engineering");
        }
      })
      .catch(() => {});

    fetchKeys();
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfileName(data?.user?.name || ""))
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!keyName.trim()) return;
    try {
      setCreatingKey(true);
      setKeyError(null);
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim(), type: keyType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create key");
      setNewKeyGenerated(data.key);
      setCreateKeyOpen(false);
      setKeyName("");
      setKeyType("client");
      fetchKeys();
    } catch (e) {
      setKeyError(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profileName }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setProfileName(data.user.name);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? SDK clients using it will lose access immediately.")) {
      return;
    }
    try {
      setRevokingId(id);
      const res = await fetch(`/api/keys/${id}/revoke`, { method: "POST" });
      if (res.ok) {
        fetchKeys();
      }
    } catch (e) {
      console.error("Failed to revoke key", e);
    } finally {
      setRevokingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update organization");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const userEmail = user?.email || "admin@experimentlab.dev";
  const activeClientKey = apiKeys.find(k => !k.revokedAt && k.type === "client");

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Settings</h3>
        <p className="text-muted m-0" style={{ fontSize: "0.875rem" }}>
          Manage your workspace, API keys, and profile.
        </p>
      </div>

      {/* Auto-provisioned / Newly Generated Key Banner */}
      {newKeyGenerated && (
        <div className="alert alert-success border-success mb-4 rounded-4 shadow-sm p-4">
          <div className="d-flex align-items-start gap-3">
            <div className="p-2 bg-success text-white rounded-3 mt-1">
              <Key size={20} />
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold text-success mb-1">New API Key Generated</h5>
              <p className="text-dark small mb-3">
                Save this key now. For your security, this key is only displayed <strong>once</strong> and cannot be retrieved later:
              </p>
              <div className="input-group mb-2">
                <input
                  type="text"
                  readOnly
                  value={newKeyGenerated}
                  className="form-control font-monospace bg-light border text-dark fw-bold"
                  style={{ fontSize: "0.875rem" }}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(newKeyGenerated, "new_generated")}
                  className="btn btn-success d-flex align-items-center gap-1.5 px-3"
                >
                  {copiedKey === "new_generated" ? <Check size={16} /> : <Copy size={16} />}
                  <span className="small fw-semibold">{copiedKey === "new_generated" ? "Copied!" : "Copy Key"}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setNewKeyGenerated(null)}
                className="btn btn-sm btn-outline-secondary mt-1"
              >
                I have safely stored this key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-8 col-12 space-y-4">

          {/* 1. Organization Settings Form */}
          <form onSubmit={handleSave}>
            <div className="box rounded-4 b-1">
              <div className="box-header b-0 pb-0 d-flex align-items-center gap-3">
                <div className="bg-info-light text-info p-2.5 rounded-3">
                  <Building size={20} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark m-0">Organization Identity</h5>
                  <p className="text-muted small m-0">Workspace name &amp; team settings</p>
                </div>
              </div>
              <div className="box-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="form-control bg-white border"
                      style={{ fontSize: "0.875rem" }}
                    />
                  </div>
                </div>
              </div>
              <div className="box-footer bg-light rounded-bottom-4 d-flex align-items-center justify-content-between">
                <div>
                  {savedSuccess && <span className="small text-success fw-bold">✓ Changes saved successfully</span>}
                  {saveError && <span className="small text-danger fw-bold">{saveError}</span>}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-coup-primary d-inline-flex align-items-center gap-2 shadow-sm ms-auto"
                >
                  <Save size={16} />
                  <span>{saving ? "Saving..." : "Save Name"}</span>
                </button>
              </div>
            </div>
          </form>

          {/* 2. API Keys Management Box */}
          <div className="box rounded-4 b-1">
            <div className="box-header b-0 pb-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary-light text-primary p-2.5 rounded-3">
                  <Key size={20} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark m-0">API Keys</h5>
                  <p className="text-muted small m-0">Secure, hashed tokens for client SDK manifest &amp; event telemetry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setKeyError(null); setKeyType("client"); setCreateKeyOpen(true); }}
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Create API key</span>
              </button>
            </div>
            <div className="box-body">
              {loadingKeys ? (
                <div className="text-center py-4 text-muted small">Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No API keys yet. Create one when you are ready to connect an application.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr className="text-muted">
                        <th>Name</th>
                        <th>Key ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((k) => (
                        <tr key={k.id}>
                          <td className="text-dark fw-semibold">{k.name}</td>
                          <td className="font-monospace text-dark fw-semibold">
                            {k.id.slice(0, 8)}...{k.id.slice(-6)}
                          </td>
                          <td>
                            <span className={`badge ${k.type === "client" ? "bg-info-light text-info" : "bg-warning-light text-warning"}`}>
                              {k.type.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {k.revokedAt ? (
                              <span className="badge bg-danger-light text-danger">Revoked</span>
                            ) : (
                              <span className="badge bg-success-light text-success">Active</span>
                            )}
                          </td>
                          <td className="text-muted">
                            {new Date(k.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-end">
                            {!k.revokedAt && (
                              <button
                                type="button"
                                disabled={revokingId === k.id}
                                onClick={() => handleRevokeKey(k.id)}
                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2"
                                title="Revoke Key"
                              >
                                <Trash2 size={13} />
                                <span>{revokingId === k.id ? "Revoking..." : "Revoke"}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 3. User Profile Box */}
          <form id="profile" onSubmit={handleProfileSave} className="box rounded-4 b-1">
            <div className="box-header b-0 pb-0 d-flex align-items-center gap-3">
              <div className="bg-primary-light text-primary p-2.5 rounded-3">
                <User size={20} />
              </div>
              <div>
                <h5 className="fw-bold text-dark m-0">User Profile</h5>
                <p className="text-muted small m-0">Your name and account details</p>
              </div>
            </div>
            <div className="box-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small">Display name</label>
                  <input type="text" required maxLength={80} value={profileName} onChange={(e) => setProfileName(e.target.value)} className="form-control bg-white border" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="form-control bg-light border text-muted font-monospace"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small">Security Role</label>
                  <div className="d-flex align-items-center gap-2 p-2.5 bg-light rounded-3 border">
                    <Shield size={16} className="text-success" />
                    <span className="fw-bold text-dark small">Owner / Administrator</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="box-footer d-flex align-items-center justify-content-between">
              <span className="small text-success">{profileSaved ? "Profile saved" : ""}</span>
              <button type="submit" disabled={profileSaving || !profileName.trim()} className="btn btn-coup-primary d-inline-flex align-items-center gap-2"><Save size={15} />{profileSaving ? "Saving…" : "Save profile"}</button>
            </div>
          </form>

        </div>

        {/* Right Column: SDK Initialization Tips & Plan */}
        <div className="col-lg-4 col-12 space-y-4">

          {/* SDK Tip Box */}
          <div className="box rounded-4 b-1">
            <div className="box-header b-0 pb-0">
              <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <Key size={16} className="text-primary" />
                <span>SDK Initialization</span>
              </h6>
            </div>
            <div className="box-body pt-2">
              <p className="text-muted small mb-2" style={{ lineHeight: 1.6 }}>
                Pass your secure <code className="bg-light text-primary px-1.5 py-0.5 rounded font-monospace">apiKey</code> to your <code className="text-dark font-monospace">ExperimentProvider</code>:
              </p>
              <pre className="bg-light p-2.5 rounded-3 text-dark font-monospace small mb-0 overflow-x-auto border">
{`<ExperimentProvider
  apiKey="${newKeyGenerated || (activeClientKey ? `exp_live_...` : "exp_live_your_key")}"
>`}
              </pre>
              <p className="text-muted small mt-2 mb-0" style={{ fontSize: "0.75rem" }}>
                🔒 Raw organization IDs are deprecated and will be rejected.
              </p>
            </div>
          </div>

        </div>
      </div>
      {createKeyOpen && (
        <div className="settings-modal-backdrop" role="presentation" onMouseDown={() => !creatingKey && setCreateKeyOpen(false)}>
          <form className="settings-modal" onSubmit={handleCreateKey} onMouseDown={(event) => event.stopPropagation()}>
            <div className="settings-modal-head"><div><h2>Create API key</h2><p>Name the key so you know where it is used.</p></div><button type="button" onClick={() => setCreateKeyOpen(false)} aria-label="Close"><X size={18} /></button></div>
            <div className="settings-modal-body">
              <label htmlFor="key-name">Key name</label>
              <input id="key-name" autoFocus required maxLength={80} value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="Production web app" />
              <label htmlFor="key-type">Key type</label>
              <select id="key-type" value={keyType} onChange={(event) => setKeyType(event.target.value as "client" | "server")}>
                <option value="client">Client — browser and mobile SDKs</option>
                <option value="server">Server — trusted backend services</option>
              </select>
              <p className="settings-key-note">{keyType === "server" ? "Server keys can access draft data. Never expose them to browsers." : "Use this key with the browser or mobile SDK."} The secret is shown once, so store it somewhere secure.</p>
              {keyError && <p className="settings-modal-error">{keyError}</p>}
            </div>
            <div className="settings-modal-actions"><button type="button" className="product-button secondary" onClick={() => setCreateKeyOpen(false)}>Cancel</button><button type="submit" className="product-button primary" disabled={creatingKey || !keyName.trim()}>{creatingKey ? "Creating…" : "Create key"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
