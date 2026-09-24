import Link from "next/link";
import { ArrowRight, Check, Code2, Server, ShieldCheck } from "lucide-react";

const installSnippet = "npm install experimentlab-node";
const initializeSnippet = `import { ExperimentNodeClient } from "experimentlab-node";

const flags = new ExperimentNodeClient({
  baseUrl: "https://flags.example.com",
  apiKey: process.env.EXPERIMENTLAB_SERVER_KEY!,
});

await flags.ready();`;
const evaluateSnippet = `const showNewCheckout = flags.getFlag(
  user.id,
  "new_checkout",
  false,
  { plan: user.plan }
);

flags.track(user.id, "checkout_started", {
  currency: "USD",
});`;

export default function NodeSdkDocsPage() {
  return (
    <div className="el-docs">
      <section className="el-docs-hero el-shell">
        <div className="el-docs-kicker"><Server size={16} /> Node.js SDK</div>
        <h1>Evaluate flags on your server.<br />Without a request at runtime.</h1>
        <p>
          The Node SDK keeps an in-memory flag manifest for your process. Your request handlers evaluate flags synchronously, with the same deterministic bucketing used by the client SDK.
        </p>
        <div className="el-hero-actions">
          <Link href="/signup" className="el-button el-button-primary">Create an account <ArrowRight size={18} /></Link>
          <a href="https://github.com/ignatius22/experimentlab" target="_blank" rel="noreferrer" className="el-button el-button-ghost"><Code2 size={18} /> View on GitHub</a>
        </div>
      </section>

      <section className="el-docs-body el-shell">
        <aside className="el-docs-toc">
          <b>Node.js SDK</b>
          <a href="#install">Install</a>
          <a href="#initialize">Initialize</a>
          <a href="#evaluate">Evaluate and track</a>
          <a href="#reliability">Reliability</a>
          <Link href="/docs/sdk-client">Client SDK</Link>
          <Link href="/docs/self-hosting">Self-hosting</Link>
        </aside>

        <article className="el-docs-content">
          <section id="install">
            <span className="el-docs-label">01 — Install</span>
            <h2>Install the package</h2>
            <p>Use a server API key from Settings → API Keys. Server keys are private credentials; never send one to a browser.</p>
            <pre><code>{installSnippet}</code></pre>
          </section>

          <section id="initialize">
            <span className="el-docs-label">02 — Initialize</span>
            <h2>Create one client per process</h2>
            <p>Initialize the client with your ExperimentLab URL and server key. It starts loading in the background by default. Await <code>ready()</code> only when you want the first manifest attempt to finish before serving traffic.</p>
            <pre><code>{initializeSnippet}</code></pre>
          </section>

          <section id="evaluate">
            <span className="el-docs-label">03 — Evaluate and track</span>
            <h2>Keep checks in-process</h2>
            <p><code>getFlag</code> is synchronous. It does not query ExperimentLab, your database, or the network when a request arrives. Pass user attributes as context for targeting rules.</p>
            <pre><code>{evaluateSnippet}</code></pre>
          </section>

          <section id="reliability" className="el-docs-reliability">
            <div className="el-icon-box"><ShieldCheck size={23} /></div>
            <h2>Designed to fail quietly</h2>
            <p>Each process polls for a fresh manifest every 60 seconds. If a refresh fails, the SDK keeps using its last-known-good manifest and logs a warning. If it has never loaded one, <code>getFlag</code> returns your supplied default value.</p>
            <ul>
              <li><Check size={16} /> No network request during flag evaluation</li>
              <li><Check size={16} /> Last-known-good cache on API outages</li>
              <li><Check size={16} /> Batched event tracking with retries</li>
            </ul>
          </section>

          <section className="el-docs-next">
            <span>Need workspace-specific keys and setup?</span>
            <Link href="/app/sdk">Open SDK setup <ArrowRight size={16} /></Link>
          </section>
        </article>
      </section>
    </div>
  );
}
