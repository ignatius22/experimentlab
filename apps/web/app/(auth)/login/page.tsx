"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CircleAlert } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      window.location.href = redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <h1>Welcome back.</h1>
      <p className="auth-lede">Sign in to manage your flags, experiments, and results.</p>
      {error && <div className="auth-error" role="alert"><CircleAlert size={17} /><span>{error}</span></div>}
      <form onSubmit={handleSubmit}>
        <div className="auth-fields">
          <div className="auth-field"><label htmlFor="email">Work email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></div>
          <div className="auth-field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></div>
        </div>
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? <><span className="auth-spinner" />Signing in…</> : <>Sign in <ArrowRight size={17} /></>}</button>
      </form>
      <p className="auth-switch">New to ExperimentLab? <Link href="/signup">Create an account</Link></p>
    </div>
  );
}

export default function LoginPage() {
  return <div className="auth-page">
    <section className="auth-form-side">
      <Link href="/" className="auth-brand"><img src="/brand/experimentlab-mark.svg" alt="" />ExperimentLab</Link>
      <Suspense fallback={<div className="auth-form-wrap">Loading…</div>}><LoginForm /></Suspense>
    </section>
  </div>;
}
