"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";

export default function NewExperimentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [metric, setMetric] = useState("signup_rate");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateName = (value: string) => {
    setName(value);
    if (!key || key === slugify(name)) setKey(slugify(value));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/experiments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), key: key.trim(), metrics: [metric.trim()] }) });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not create the experiment.");
      }
      router.push(`/app/experiments/${data.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the experiment.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="experiment-create-page">
    <Link href="/app/experiments" className="experiment-create-back"><ArrowLeft size={15} /> Experiments</Link>
    <header className="experiment-create-header"><span><FlaskConical size={18} /></span><div><h1>Create an experiment</h1><p>Set the identity and primary outcome. Traffic allocation can be adjusted after creation.</p></div></header>
    <form className="experiment-create-form" onSubmit={submit}>
      <div className="experiment-form-field"><label htmlFor="experiment-name">Name</label><input id="experiment-name" autoFocus required minLength={2} value={name} onChange={(event) => updateName(event.target.value)} placeholder="Checkout button copy" /><small>A clear internal name for your team.</small></div>
      <div className="experiment-form-field"><label htmlFor="experiment-key">Experiment key</label><input id="experiment-key" required pattern="[A-Za-z0-9_]+" value={key} onChange={(event) => setKey(slugify(event.target.value))} placeholder="checkout_button_copy" /><small>Used by the SDK. Letters, numbers, and underscores only.</small></div>
      <div className="experiment-form-field"><label htmlFor="experiment-metric">Primary metric</label><input id="experiment-metric" required pattern="[A-Za-z0-9_]+" value={metric} onChange={(event) => setMetric(slugify(event.target.value))} placeholder="signup_rate" /><small>The conversion event used to compare variants.</small></div>
      <div className="experiment-defaults"><strong>Initial setup</strong><span>Draft · 2 variants · 50/50 traffic split</span></div>
      {error && <p className="experiment-create-error">{error}</p>}
      <footer><Link href="/app/experiments" className="product-button secondary">Cancel</Link><button className="product-button primary" type="submit" disabled={saving || name.trim().length < 2 || !key || !metric}>{saving ? "Creating…" : "Create experiment"}</button></footer>
    </form>
  </div>;
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
