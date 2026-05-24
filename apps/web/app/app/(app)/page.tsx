import Link from "next/link";
import { Card } from "@experiment/ui";
import { FlaskConical, Flag, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AppHome() {
  return (
    <section className="stack" style={{ gap: "var(--space-8)" }}>
      <header>
        <h1 style={{ fontSize: "2.2rem" }}>Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
          Welcome to the ExperimentLab control center.
        </p>
      </header>

      <div className="grid">
        <Card className="stack">
          <FlaskConical size={32} color="var(--color-accent)" />
          <h3 style={{ marginTop: "var(--space-2)" }}>Experiments</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Create and monitor A/B tests. View real-time statistical significance.
          </p>
          <Link href="/app/experiments" className="ui-sidebar-link" style={{ padding: 0, color: "var(--color-accent)", background: "transparent" }}>
            Manage Experiments <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </Link>
        </Card>

        <Card className="stack">
          <Flag size={32} color="var(--color-accent)" />
          <h3 style={{ marginTop: "var(--space-2)" }}>Feature Flags</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Instant feature toggles with advanced targeting rules and rollouts.
          </p>
          <Link href="/app/flags" className="ui-sidebar-link" style={{ padding: 0, color: "var(--color-accent)", background: "transparent" }}>
            Control Flags <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </Link>
        </Card>

        <Card className="stack">
          <Zap size={32} color="var(--color-accent)" />
          <h3 style={{ marginTop: "var(--space-2)" }}>Performance</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Live Core Web Vitals monitoring. See how experiments impact your speed.
          </p>
          <Link href="/app/performance" className="ui-sidebar-link" style={{ padding: 0, color: "var(--color-accent)", background: "transparent" }}>
            View Metrics <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </Link>
        </Card>
      </div>

      <div style={{ marginTop: "var(--space-8)" }}>
        <h3 style={{ marginBottom: "var(--space-4)" }}>Getting Started</h3>
        <Card style={{ background: "var(--color-primary)", color: "white" }}>
          <div className="stack" style={{ gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle2 size={20} color="var(--color-accent)" />
              <p>Install the SDK in your application.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle2 size={20} color="var(--color-accent)" />
              <p>Initialize with your Organization ID (Publishable Key).</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle2 size={20} color="var(--color-accent)" />
              <p>Define a flag or experiment here in the dashboard.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle2 size={20} color="var(--color-accent)" />
              <p>Start tracking conversions to see results!</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
