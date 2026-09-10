import Link from "next/link";
import { ArrowRight, Check, Code2, MonitorSmartphone, ShieldCheck } from "lucide-react";

const installSnippet = "npm install experimentlab-react experimentlab-core";
const providerSnippet = `import { ExperimentProvider } from "experimentlab-react";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ExperimentProvider
      publishableKey={process.env.NEXT_PUBLIC_EXPERIMENTLAB_KEY!}
      baseUrl="https://flags.example.com"
      userId="user_123"
      context={{ plan: "team" }}
    >
      {children}
    </ExperimentProvider>
  );
}`;
const useFlagSnippet = `import { useFlag, useTrack } from "experimentlab-react";

export function Checkout() {
  const enabled = useFlag("new_checkout");
  const track = useTrack();

  return <button onClick={() => track("checkout_started")}>
    {enabled ? "Use new checkout" : "Continue"}
  </button>;
}`;

export default function ClientSdkDocsPage() {
  return (
    <div className="el-docs">
      <section className="el-docs-hero el-shell">
        <div className="el-docs-kicker"><MonitorSmartphone size={16} /> Client SDK</div>
        <h1>Flags that resolve<br />in your application.</h1>
        <p>Use the React SDK to fetch a published manifest, then evaluate flags and experiments locally in the browser. Your components do not wait on a request every time a flag is checked.</p>
        <div className="el-hero-actions"><Link href="/signup" className="el-button el-button-primary">Create an account <ArrowRight size={18} /></Link><a href="https://github.com/ignatius22/experimentlab" target="_blank" rel="noreferrer" className="el-button el-button-ghost"><Code2 size={18} /> View on GitHub</a></div>
      </section>

      <section className="el-docs-body el-shell">
        <aside className="el-docs-toc"><b>Client SDK</b><a href="#install">Install</a><a href="#configure">Configure</a><a href="#evaluate">Evaluate and track</a><a href="#security">Security</a><Link href="/docs/sdk-node">Node.js SDK</Link><Link href="/docs/self-hosting">Self-hosting</Link></aside>
        <article className="el-docs-content">
          <section id="install"><span className="el-docs-label">01 — Install</span><h2>Install the React SDK</h2><p>The React package provides <code>ExperimentProvider</code>, <code>useFlag</code>, <code>useExperiment</code>, and <code>useTrack</code>.</p><pre><code>{installSnippet}</code></pre></section>
          <section id="configure"><span className="el-docs-label">02 — Configure</span><h2>Wrap your application</h2><p>Create a <strong>client</strong> API key in Settings → API Keys and pass it to your application. The client key is designed for browser and mobile SDKs; do not use a server key here.</p><pre><code>{providerSnippet}</code></pre></section>
          <section id="evaluate"><span className="el-docs-label">03 — Evaluate and track</span><h2>Use hooks in your components</h2><p>The SDK refreshes its manifest in the background. After it has loaded, flags are evaluated in memory using deterministic user bucketing and targeting rules.</p><pre><code>{useFlagSnippet}</code></pre></section>
          <section id="security" className="el-docs-reliability"><div className="el-icon-box"><ShieldCheck size={23} /></div><h2>Use the right key for the runtime</h2><p>Client keys only receive published flags and active/completed experiments. They can be embedded in browser applications. Server keys receive a broader trusted-server manifest and must remain on your backend.</p><ul><li><Check size={16} /> Client key for browser and mobile code</li><li><Check size={16} /> Server key only for Node.js or backend services</li><li><Check size={16} /> Raw organization IDs are never API credentials</li></ul></section>
          <section className="el-docs-next"><span>Running ExperimentLab on your own infrastructure?</span><Link href="/docs/self-hosting">Read self-hosting <ArrowRight size={16} /></Link></section>
        </article>
      </section>
    </div>
  );
}
