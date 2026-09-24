import Link from "next/link";
import { ArrowRight, Check, Code2, Container, ShieldCheck } from "lucide-react";

const cloneSnippet = `git clone https://github.com/ignatius22/experimentlab.git
cd experimentlab
cp .env.example .env`;
const envSnippet = `POSTGRES_PASSWORD="use-a-strong-password"
DATABASE_URL="postgresql://experiment_user:use-a-strong-password@postgres:5432/experimentlab_db?schema=public"
AUTH_SECRET="paste-a-generated-64-character-secret-here"
REDIS_URL="redis://redis:6379"
NEXT_PUBLIC_APP_URL="https://flags.example.com"`;
const runSnippet = `docker compose up -d --build
docker compose ps`;

export default function SelfHostingDocsPage() {
  return (
    <div className="el-docs">
      <section className="el-docs-hero el-shell"><div className="el-docs-kicker"><Container size={16} /> Self-hosting</div><h1>Run ExperimentLab<br />on your infrastructure.</h1><p>ExperimentLab ships as a Docker Compose stack with PostgreSQL, Redis, the web application, and an event-ingestion worker. Your flags, events, and customer data stay in your environment.</p><div className="el-hero-actions"><a href="https://github.com/ignatius22/experimentlab" target="_blank" rel="noreferrer" className="el-button el-button-primary"><Code2 size={18} /> Get the source</a><Link href="/signup" className="el-button el-button-ghost">Create an account <ArrowRight size={18} /></Link></div></section>
      <section className="el-docs-body el-shell"><aside className="el-docs-toc"><b>Self-hosting</b><a href="#requirements">Requirements</a><a href="#configure">Configure</a><a href="#run">Run</a><a href="#operations">Operations</a><Link href="/docs/sdk-client">Client SDK</Link><Link href="/docs/sdk-node">Node.js SDK</Link></aside>
        <article className="el-docs-content">
          <section id="requirements"><span className="el-docs-label">01 — Requirements</span><h2>Prepare a Linux host</h2><p>You need Docker Engine with the Compose plugin, a publicly reachable application URL for hosted SDK clients, and persistent disk for PostgreSQL and Redis volumes. Put TLS termination in front of port 3005 for production.</p></section>
          <section><span className="el-docs-label">02 — Get the project</span><h2>Copy the environment template</h2><p>Keep <code>.env</code> private. It contains database and application secrets and must not be committed to Git.</p><pre><code>{cloneSnippet}</code></pre></section>
          <section id="configure"><span className="el-docs-label">03 — Configure</span><h2>Set production values</h2><p>Use a new 64-character <code>AUTH_SECRET</code>, a strong database password, and your real public URL. Generate the secret in your terminal, then paste its output into <code>.env</code>; environment files do not run shell commands.</p><pre><code>{`openssl rand -hex 32`}</code></pre><pre><code>{envSnippet}</code></pre></section>
          <section id="run"><span className="el-docs-label">04 — Run</span><h2>Start the stack</h2><p>The web service listens on host port 3005. Redis buffers event ingestion and the worker flushes queued events to PostgreSQL.</p><pre><code>{runSnippet}</code></pre></section>
          <section id="operations" className="el-docs-reliability"><div className="el-icon-box"><ShieldCheck size={23} /></div><h2>Operate it deliberately</h2><p>Back up PostgreSQL before database migrations. Use explicit, reviewed releases for production and confirm the web health endpoint after every deployment.</p><ul><li><Check size={16} /> Keep PostgreSQL and Redis volumes on persistent storage</li><li><Check size={16} /> Never put server API keys or <code>.env</code> in client code</li><li><Check size={16} /> Apply migrations before replacing application containers</li></ul></section>
          <section className="el-docs-next"><span>Ready to connect an application?</span><Link href="/docs/sdk-client">Read the Client SDK <ArrowRight size={16} /></Link></section>
        </article>
      </section>
    </div>
  );
}
