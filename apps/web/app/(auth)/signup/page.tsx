"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, orgName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create account");
      window.location.href = "/app";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page">
    <section className="auth-form-side">
      <Link href="/" className="auth-brand"><img src="/brand/experimentlab-mark.svg" alt="" />ExperimentLab</Link>
      <div className="auth-form-wrap">
        <h1>Create your account.</h1>
        <p className="auth-lede">Create your workspace. No credit card required.</p>
        {error && <div className="auth-error" role="alert"><CircleAlert size={17} /><span>{error}</span></div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-fields">
            <div className="auth-field-grid">
              <div className="auth-field"><label htmlFor="name">Your name</label><input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Doe" /></div>
              <div className="auth-field"><label htmlFor="organization">Organization</label><input id="organization" type="text" autoComplete="organization" value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="Acme" /></div>
            </div>
            <div className="auth-field"><label htmlFor="email">Work email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></div>
            <div className="auth-field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" /></div>
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? <><span className="auth-spinner" />Creating workspace…</> : <>Create workspace <ArrowRight size={17} /></>}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
      </div>
    </section>
  </div>;
}
