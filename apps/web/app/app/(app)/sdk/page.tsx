"use client";

import { useState } from "react";
import { 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  Sparkles, 
  Zap, 
  Layers, 
  PackageCheck, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";

export default function SdkPage() {
  const [activeTab, setActiveTab] = useState<"npm" | "pnpm" | "yarn">("npm");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const installCommands = {
    npm: "npm install experimentlab-react experimentlab-core",
    pnpm: "pnpm add experimentlab-react experimentlab-core",
    yarn: "yarn add experimentlab-react experimentlab-core",
  };

  const providerCode = `import { ExperimentProvider } from "experimentlab-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExperimentProvider
      orgId="your-organization-id"
      apiKey="exp_live_..."
      user={{
        id: "usr_94821",
        email: "alex@company.com",
        attributes: { plan: "enterprise", region: "us-east" }
      }}
    >
      {children}
    </ExperimentProvider>
  );
}`;

  const flagCode = `import { useFlag } from "experimentlab-react";

export function CheckoutButton() {
  // Evaluates FNV-1a hash targeting in 0.05ms without layout shift
  const isOneClickEnabled = useFlag("one-click-checkout", false);

  return (
    <button className={isOneClickEnabled ? "btn-primary" : "btn-secondary"}>
      {isOneClickEnabled ? "Instant Buy Now" : "Standard Checkout"}
    </button>
  );
}`;

  const experimentCode = `import { useExperiment } from "experimentlab-react";

export function PricingHero() {
  // Buckets visitors deterministically and reports exposure event
  const { variant, track } = useExperiment("pricing-v2-experiment", {
    fallback: "control"
  });

  return (
    <section>
      {variant === "annual-discount" ? (
        <h2>Track an experiment outcome</h2>
      ) : (
        <h2>Simple, Predictable Pricing</h2>
      )}
      <button onClick={() => track("checkout_completed", { plan: "pro" })}>
        Select Plan
      </button>
    </section>
  );
}`;

  const nodeCode = `import { ExperimentClient } from "experimentlab-core";

const client = new ExperimentClient({
  orgId: "your-organization-id",
  apiKey: process.env.EXPERIMENTLAB_API_KEY
});

// Evaluate flags inside edge functions or Node microservices
const isEnabled = await client.evaluateFlag("new-checkout", {
  userId: "user_123",
  attributes: { betaTester: true }
});`;

  return (
    <div>
      {/* Coup Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">SDK</h3>
          <p className="text-muted m-0" style={{ fontSize: "0.875rem" }}>
            Connect your React, Next.js, or Node.js application to ExperimentLab.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <a
            href="https://www.npmjs.com/package/experimentlab-react"
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-coup-light d-flex align-items-center gap-1.5 shadow-xs"
          >
            <span className="badge bg-danger rounded-circle" style={{ width: 7, height: 7, padding: 0 }}></span>
            <span>npm: experimentlab-react</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="https://www.npmjs.com/package/experimentlab-core"
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-coup-light d-flex align-items-center gap-1.5 shadow-xs"
          >
            <span className="badge bg-danger rounded-circle" style={{ width: 7, height: 7, padding: 0 }}></span>
            <span>npm: experimentlab-core</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Coup Highlights Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4 col-12">
          <div className="box rounded-4 b-1 h-100">
            <div className="box-body d-flex align-items-center gap-3">
              <div className="bg-primary-light text-primary p-3 rounded-circle">
                <Zap size={22} />
              </div>
              <div>
                <h6 className="fw-bold text-dark m-0">Zero Network Roundtrips</h6>
                <p className="text-muted small m-0 mt-0.5">Evaluation runs locally via FNV-1a in &lt; 0.05ms</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-12">
          <div className="box rounded-4 b-1 h-100">
            <div className="box-body d-flex align-items-center gap-3">
              <div className="bg-success-light text-success p-3 rounded-circle">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h6 className="fw-bold text-dark m-0">Strict Type Safety</h6>
                <p className="text-muted small m-0 mt-0.5">First-class TypeScript declarations bundled</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-12">
          <div className="box rounded-4 b-1 h-100">
            <div className="box-body d-flex align-items-center gap-3">
              <div className="bg-info-light text-info p-3 rounded-circle">
                <PackageCheck size={22} />
              </div>
              <div>
                <h6 className="fw-bold text-dark m-0">Micro Footprint</h6>
                <p className="text-muted small m-0 mt-0.5">Zero runtime dependencies • &lt; 4KB gzipped</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Installation Box */}
      <div className="box rounded-4 b-1 mb-4 shadow-sm">
        <div className="box-header no-border pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 24, height: 24, padding: 0 }}>
              1
            </span>
            <h5 className="fw-bold text-dark m-0">Install Client Packages</h5>
          </div>

          {/* Package Manager Selector */}
          <div className="d-flex align-items-center bg-light p-1 rounded-pill border">
            {(["npm", "pnpm", "yarn"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn btn-sm rounded-pill px-3 py-1 font-monospace fw-semibold ${
                  activeTab === tab 
                    ? "btn-primary text-white shadow-xs" 
                    : "btn-light text-secondary border-0"
                }`}
                style={{ fontSize: "0.8rem" }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="box-body">
          <div className="position-relative rounded-3 p-3 font-monospace overflow-hidden" style={{ background: "#111827" }}>
            <div className="text-emerald-400 small mb-0 py-1" style={{ color: "#34d399" }}>$ {installCommands[activeTab]}</div>
            <button
              onClick={() => copyToClipboard(installCommands[activeTab], "install")}
              className="position-absolute top-0 end-0 m-2.5 btn btn-sm d-flex align-items-center gap-1.5 shadow-sm fw-semibold"
              style={{
                backgroundColor: "#1f2937",
                color: copied === "install" ? "#34d399" : "#e5e7eb",
                border: "1px solid #374151",
                fontSize: "0.75rem",
                padding: "5px 10px",
                borderRadius: "6px"
              }}
            >
              {copied === "install" ? (
                <>
                  <Check size={14} style={{ color: "#34d399" }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} style={{ color: "#9ca3af" }} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Provider Setup Box */}
      <div className="box rounded-4 b-1 mb-4 shadow-sm">
        <div className="box-header no-border pb-0 d-flex align-items-center gap-2">
          <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 24, height: 24, padding: 0 }}>
            2
          </span>
          <h5 className="fw-bold text-dark m-0">Mount &lt;ExperimentProvider /&gt;</h5>
        </div>

        <div className="box-body">
          <p className="text-muted small mb-3">
            Wrap your application root (e.g. Next.js App Router <code>layout.tsx</code> or Vite <code>main.tsx</code>). The provider syncs your flag and experiment manifest in the background.
          </p>

          <div className="position-relative rounded-3 p-3 font-monospace overflow-x-auto" style={{ background: "#111827", color: "#d1d5db", fontSize: "0.825rem" }}>
            <pre className="m-0" style={{ whiteSpace: "pre-wrap", color: "#f3f4f6" }}>
              <code>{providerCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(providerCode, "provider")}
              className="position-absolute top-0 end-0 m-2.5 btn btn-sm d-flex align-items-center gap-1.5 shadow-sm fw-semibold"
              style={{
                backgroundColor: "#1f2937",
                color: copied === "provider" ? "#34d399" : "#e5e7eb",
                border: "1px solid #374151",
                fontSize: "0.75rem",
                padding: "5px 10px",
                borderRadius: "6px"
              }}
            >
              {copied === "provider" ? (
                <>
                  <Check size={14} style={{ color: "#34d399" }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} style={{ color: "#9ca3af" }} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Dual Hooks Example Grid */}
      <div className="row g-4 mb-4">
        {/* Hook 1: useFlag */}
        <div className="col-lg-6 col-12">
          <div className="box rounded-4 b-1 h-100 d-flex flex-column justify-content-between shadow-sm">
            <div className="box-header no-border pb-0 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Code2 size={18} className="text-primary" />
                <h5 className="fw-bold text-dark m-0">Feature Flags: <code>useFlag</code></h5>
              </div>
              <span className="badge bg-primary-light text-primary font-monospace small">Boolean / Rules</span>
            </div>

            <div className="box-body">
              <p className="text-muted small mb-3">
                Evaluates targeting rules against the current user context without any layout flicker.
              </p>

              <div className="position-relative rounded-3 p-3 font-monospace overflow-x-auto" style={{ background: "#111827", color: "#d1d5db", fontSize: "0.8rem" }}>
                <pre className="m-0" style={{ whiteSpace: "pre-wrap", color: "#f3f4f6" }}>
                  <code>{flagCode}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(flagCode, "flag")}
                  className="position-absolute top-0 end-0 m-2.5 btn btn-sm d-flex align-items-center gap-1.5 shadow-sm fw-semibold"
                  style={{
                    backgroundColor: "#1f2937",
                    color: copied === "flag" ? "#34d399" : "#e5e7eb",
                    border: "1px solid #374151",
                    fontSize: "0.75rem",
                    padding: "5px 10px",
                    borderRadius: "6px"
                  }}
                >
                  {copied === "flag" ? (
                    <>
                      <Check size={14} style={{ color: "#34d399" }} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} style={{ color: "#9ca3af" }} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hook 2: useExperiment */}
        <div className="col-lg-6 col-12">
          <div className="box rounded-4 b-1 h-100 d-flex flex-column justify-content-between shadow-sm">
            <div className="box-header no-border pb-0 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Sparkles size={18} className="text-info" />
                <h5 className="fw-bold text-dark m-0">A/B Testing: <code>useExperiment</code></h5>
              </div>
              <span className="badge bg-info-light text-info font-monospace small">Sticky Variant</span>
            </div>

            <div className="box-body">
              <p className="text-muted small mb-3">
                Buckets visitors deterministically and reports exposure events automatically.
              </p>

              <div className="position-relative rounded-3 p-3 font-monospace overflow-x-auto" style={{ background: "#111827", color: "#d1d5db", fontSize: "0.8rem" }}>
                <pre className="m-0" style={{ whiteSpace: "pre-wrap", color: "#f3f4f6" }}>
                  <code>{experimentCode}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(experimentCode, "exp")}
                  className="position-absolute top-0 end-0 m-2.5 btn btn-sm d-flex align-items-center gap-1.5 shadow-sm fw-semibold"
                  style={{
                    backgroundColor: "#1f2937",
                    color: copied === "exp" ? "#34d399" : "#e5e7eb",
                    border: "1px solid #374151",
                    fontSize: "0.75rem",
                    padding: "5px 10px",
                    borderRadius: "6px"
                  }}
                >
                  {copied === "exp" ? (
                    <>
                      <Check size={14} style={{ color: "#34d399" }} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} style={{ color: "#9ca3af" }} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Server-Side Node.js Box */}
      <div className="box rounded-4 b-1 mb-4 shadow-sm">
        <div className="box-header no-border pb-0 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Cpu size={18} className="text-success" />
            <h5 className="fw-bold text-dark m-0">Server-Side &amp; Node.js Microservices</h5>
          </div>
          <span className="badge bg-success-light text-success font-monospace small">experimentlab-core</span>
        </div>

        <div className="box-body">
          <p className="text-muted small mb-3">
            Use the standalone TypeScript SDK inside backend services, edge middleware, and serverless handlers.
          </p>

          <div className="position-relative rounded-3 p-3 font-monospace overflow-x-auto" style={{ background: "#111827", color: "#d1d5db", fontSize: "0.825rem" }}>
            <pre className="m-0" style={{ whiteSpace: "pre-wrap", color: "#f3f4f6" }}>
              <code>{nodeCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(nodeCode, "node")}
              className="position-absolute top-0 end-0 m-2.5 btn btn-sm d-flex align-items-center gap-1.5 shadow-sm fw-semibold"
              style={{
                backgroundColor: "#1f2937",
                color: copied === "node" ? "#34d399" : "#e5e7eb",
                border: "1px solid #374151",
                fontSize: "0.75rem",
                padding: "5px 10px",
                borderRadius: "6px"
              }}
            >
              {copied === "node" ? (
                <>
                  <Check size={14} style={{ color: "#34d399" }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} style={{ color: "#9ca3af" }} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
