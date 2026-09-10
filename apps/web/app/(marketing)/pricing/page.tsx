import Link from "next/link";
import { ArrowRight, Check, Lock, Server, Zap } from "lucide-react";

const features = [
  "Feature flags and A/B experiments",
  "Deterministic local SDK evaluation",
  "Queued event ingestion with Redis",
  "PostgreSQL-backed dashboard and analytics",
  "Docker Compose deployment",
  "Apache 2.0 licensed source code",
];

export default function PricingPage() {
  return (
    <div className="py-20 px-6 sm:px-8 max-w-5xl mx-auto w-full space-y-16">
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-violet-500">Community Edition</p>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-zinc-900">Run proper experimentation on your own infrastructure.</h1>
        <p className="text-base text-zinc-600">The open-source edition is complete for self-hosting: no checkout flow, usage gate, or proprietary service is required.</p>
      </header>

      <article className="max-w-lg mx-auto rounded-2xl p-8 sm:p-10 border border-zinc-200 bg-white shadow-sm">
        <span className="text-xs font-semibold tracking-[0.14em] uppercase text-violet-600">Community</span>
        <div className="flex items-baseline gap-2 mt-3 pb-6 border-b border-zinc-100"><strong className="text-5xl font-medium text-zinc-900">$0</strong><span className="text-sm text-zinc-500">self-hosted</span></div>
        <p className="mt-6 text-sm leading-6 text-zinc-600">Install ExperimentLab in your own environment and keep control of your flags, experiments, and event data.</p>
        <ul className="mt-7 space-y-3 text-sm text-zinc-700">{features.map((feature) => <li key={feature} className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
        <a href="https://github.com/ignatius22/experimentlab" target="_blank" rel="noreferrer" className="mt-8 w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white"><span>Get the source</span><ArrowRight size={16} /></a>
      </article>

      <section className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center gap-2"><Server size={22} className="text-violet-600" /><h2 className="text-sm font-medium text-zinc-900">Self-hostable</h2><p className="text-xs leading-5 text-zinc-600">Run the Compose stack on infrastructure you control.</p></div>
        <div className="flex flex-col items-center gap-2"><Lock size={22} className="text-emerald-600" /><h2 className="text-sm font-medium text-zinc-900">Your data stays yours</h2><p className="text-xs leading-5 text-zinc-600">Customer identifiers and metrics remain in your environment.</p></div>
        <div className="flex flex-col items-center gap-2"><Zap size={22} className="text-amber-600" /><h2 className="text-sm font-medium text-zinc-900">Local evaluation</h2><p className="text-xs leading-5 text-zinc-600">SDKs evaluate flags in memory without a request per check.</p></div>
      </section>

      <p className="text-center text-sm text-zinc-600">Need implementation help? Start with the <Link className="underline underline-offset-4" href="/docs/self-hosting">self-hosting guide</Link>.</p>
    </div>
  );
}
