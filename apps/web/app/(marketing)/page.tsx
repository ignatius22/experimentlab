import Link from "next/link";
import { Button, Card, Badge } from "@experiment/ui";
import { 
  Zap, 
  Flag, 
  BarChart3, 
  Layers, 
  Globe, 
  Shield, 
  ArrowRight,
  Code2,
  PieChart
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="stack" style={{ gap: 0 }}>
      {/* Hero Section */}
      <section style={{ 
        padding: "var(--space-12) var(--space-8)",
        textAlign: "center",
        background: "radial-gradient(circle at center, #f0fdfa 0%, white 100%)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }} className="stack">
          <Badge variant="accent" style={{ alignSelf: "center", marginBottom: 12 }}>
            Next Generation Experimentation
          </Badge>
          <h1 style={{ fontSize: "4rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Ship features with <span style={{ color: "var(--color-accent)" }}>confidence.</span>
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--color-text-muted)", maxWidth: 600, margin: "24px auto" }}>
            The only feature management platform with built-in Core Web Vitals guardrails and real-time statistical significance.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
            <Link href="/app">
              <Button style={{ padding: "14px 28px", fontSize: "1.1rem" }}>
                Start Free Trial
                <ArrowRight size={20} style={{ marginLeft: 8 }} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" style={{ padding: "14px 28px", fontSize: "1.1rem" }}>
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ padding: "var(--space-12) var(--space-8)", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 700 }}>Everything you need to ship faster</h2>
        </div>

        <div className="grid">
          <Card className="stack">
            <Flag size={32} color="var(--color-accent)" />
            <h3 style={{ marginTop: 8 }}>Feature Flags</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              Decouple deploy from release. Toggle features instantly with advanced targeting rules and gradual rollouts.
            </p>
          </Card>

          <Card className="stack">
            <BarChart3 size={32} color="var(--color-accent)" />
            <h3 style={{ marginTop: 8 }}>A/B Testing</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              Run experiments on any metric. Our Frequentist engine calculates p-values and confidence intervals automatically.
            </p>
          </Card>

          <Card className="stack">
            <Zap size={32} color="var(--color-accent)" />
            <h3 style={{ marginTop: 8 }}>Performance First</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              Built-in Core Web Vitals monitoring. See how every experiment impacts your LCP, INP, and CLS in real-time.
            </p>
          </Card>

          <Card className="stack">
            <Code2 size={32} color="var(--color-accent)" />
            <h3 style={{ marginTop: 8 }}>Developer SDKs</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              Lightweight, framework-agnostic core with high-performance React hooks. Evaluation happens locally for zero latency.
            </p>
          </Card>

          <Card className="stack">
            <Shield size={32} color="var(--color-accent)" />
            <h3 style={{ marginTop: 8 }}>Multi-tenancy</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              Enterprise-grade isolation. Manage multiple organizations and teams from a single control plane.
            </p>
          </Card>

          <Card className="stack">
            <Layers size={32} color="var(--color-accent)" />
            <h3 style={{ marginTop: 8 }}>Advanced Targeting</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              Target specific user segments based on plan, country, or any custom attribute you define in your context.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: "var(--space-12) var(--space-8)", 
        background: "var(--color-primary)", 
        color: "white",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: 24 }}>Ready to optimize your product?</h2>
        <p style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
          Join high-performance teams using ExperimentLab to deliver data-driven user experiences.
        </p>
        <Link href="/app">
          <Button style={{ padding: "14px 40px", fontSize: "1.1rem", background: "white", color: "var(--color-primary)" }}>
            Get Started for Free
          </Button>
        </Link>
      </section>
    </div>
  );
}
