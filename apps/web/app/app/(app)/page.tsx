import Link from "next/link";
import { prisma } from "@experiment/db";
import { auth } from "@/lib/auth/server";
import { ArrowRight, BarChart3, Flag, FlaskConical, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session?.orgId || "";
  const [flagsCount, activeExperiments, eventsCount, recentExperiments, recentFlags] = await Promise.all([
    prisma.featureFlag.count({ where: { organizationId: orgId } }),
    prisma.experiment.count({ where: { organizationId: orgId, status: { in: ["active", "running"] } } }),
    prisma.event.count({ where: { organizationId: orgId } }),
    prisma.experiment.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.featureFlag.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 4 })
  ]);

  const firstName = session?.email?.split("@")[0] || "there";
  const empty = flagsCount === 0 && recentExperiments.length === 0;

  return <div className="dashboard">
    <div className="dashboard-heading">
      <div><p className="dashboard-overline">{session?.orgName || "Workspace"}</p><h1>Good to see you, {firstName}.</h1><p>Here’s what is happening across your releases.</p></div>
      <div className="dashboard-actions"><Link href="/app/flags" className="product-button secondary">View flags</Link><Link href="/app/experiments" className="product-button primary"><Plus size={16} /> New experiment</Link></div>
    </div>

    <section className="metric-strip" aria-label="Workspace summary">
      <Link href="/app/flags"><span><Flag size={18} /> Feature flags</span><strong>{flagsCount}</strong><small>of 5 on Community</small></Link>
      <Link href="/app/experiments"><span><FlaskConical size={18} /> Active experiments</span><strong>{activeExperiments}</strong><small>1 available at a time</small></Link>
      <Link href="/app/analytics"><span><BarChart3 size={18} /> Events received</span><strong>{eventsCount.toLocaleString()}</strong><small>this workspace</small></Link>
    </section>

    {empty ? <section className="dashboard-onboarding">
      <div><span className="step-number">01</span><h2>Create your first feature flag.</h2><p>Start with one release you want to control independently from deployment.</p><Link href="/app/flags">Create a flag <ArrowRight size={16} /></Link></div>
      <div className="onboarding-code"><div><i /><i /><i /><span>checkout.tsx</span></div><pre><code><span>const</span> enabled = useFlag(<b>&quot;new_checkout&quot;</b>);{"\n\n"}return enabled{"\n  "}? &lt;NewCheckout /&gt;{"\n  "}: &lt;ClassicCheckout /&gt;;</code></pre></div>
    </section> : <div className="dashboard-grid">
      <section className="dashboard-panel"><header><div><h2>Recent experiments</h2><p>Your latest test activity</p></div><Link href="/app/experiments">View all <ArrowRight size={14} /></Link></header><div className="activity-list">{recentExperiments.length ? recentExperiments.map((experiment) => <Link href={`/app/experiments/${experiment.id}`} key={experiment.id}><div><strong>{experiment.name}</strong><small>{experiment.key}</small></div><span className={`status ${experiment.status?.toLowerCase()}`}>{experiment.status || "draft"}</span></Link>) : <p className="panel-empty">No experiments yet.</p>}</div></section>
      <section className="dashboard-panel"><header><div><h2>Feature flags</h2><p>Recently created controls</p></div><Link href="/app/flags">View all <ArrowRight size={14} /></Link></header><div className="activity-list">{recentFlags.length ? recentFlags.map((flag) => <Link href="/app/flags" key={flag.id}><div><strong>{flag.name}</strong><small>{flag.key}</small></div><span className={`status ${flag.enabled ? "running" : "draft"}`}>{flag.enabled ? "on" : "off"}</span></Link>) : <p className="panel-empty">No feature flags yet.</p>}</div></section>
    </div>}
  </div>;
}
