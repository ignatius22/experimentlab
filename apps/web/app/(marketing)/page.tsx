import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { ArrowRight, Check, Code2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { FloatCard, HeroMotion, RevealSection, StageMotion } from "@/components/marketing/LandingMotion";

export default async function MarketingHomePage() {
  const { userId } = await auth();
  const primaryHref = userId ? "/app" : "/signup";

  return (
    <div className="el-landing">
      <section className="el-hero">
        <HeroMotion className="el-shell el-hero-inner">
          <h1>Feature flags and A/B testing<br />that <em>don&apos;t need a network</em><br />call to check.</h1>
          <p>ExperimentLab evaluates flags locally in your app — no round-trip, no dependency on our uptime. Self-host it on your own infrastructure in minutes.</p>
          <div className="el-hero-actions">
            <Link href={primaryHref} className="el-button el-button-primary">
              {userId ? "Open dashboard" : "Get started free"}<ArrowRight size={18} />
            </Link>
            <a href="https://github.com/ignatius22/experimentlab" target="_blank" rel="noreferrer" className="el-button el-button-ghost">
              <Code2 size={18} /> View on GitHub
            </a>
          </div>
          <div className="el-proof-row">
            <span><Check size={15} /> No credit card required</span>
            <span><Check size={15} /> Self-host in minutes</span>
          </div>
        </HeroMotion>

        <StageMotion className="el-shell el-product-stage">
          <div className="el-window">
            <div className="el-window-bar"><i /><i /><i /><span>app.experimentlab.dev</span></div>
            <div className="el-app-preview">
              <aside>
                <img className="el-mini-logo" src="/brand/experimentlab-mark.svg" alt="" />
                <b>ExperimentLab</b>
                <nav><span className="active">Overview</span><span>Feature flags</span><span>Experiments</span><span>Analytics</span></nav>
              </aside>
              <main>
                <div className="el-preview-heading"><div><small>WORKSPACE</small><h3>Good morning, team.</h3></div><button>+ New experiment</button></div>
                <div className="el-metric-grid">
                  <article><small>Active flags</small><strong>18</strong><span className="up">↑ 12%</span></article>
                  <article><small>Running experiments</small><strong>4</strong><span>2 nearing significance</span></article>
                  <article><small>Events this month</small><strong>428k</strong><span>of 1M included</span></article>
                </div>
                <div className="el-chart-card">
                  <div><small>EXPERIMENT</small><h4>Onboarding flow v2</h4></div>
                  <div className="el-chart"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
                  <div className="el-chart-legend"><b>Variant B +14.8%</b><span>94.2% confidence</span></div>
                </div>
              </main>
            </div>
          </div>
        </StageMotion>
      </section>

      <RevealSection className="el-intro el-shell">
        <h2>Flags tell you when to ship.<br />Experiments tell you what to keep.</h2>
      </RevealSection>

      <RevealSection id="platform" className="el-feature-row el-shell">
        <div className="el-feature-copy">
          <div className="el-icon-box"><Zap size={23} /></div>
          <h3>Deterministic, client-side evaluation.</h3>
          <p>Your SDK checks flags instantly, in-process. No latency spike waiting on us, no blank UI while a flag resolves.</p>
          <Link href={primaryHref}>Explore feature flags <ArrowRight size={17} /></Link>
        </div>
        <div className="el-visual flag-surface">
          <FloatCard className="el-flag-card">
            <div className="el-flag-top"><span className="el-status-dot" /><div><b>new_checkout</b><small>Production</small></div><button className="el-toggle"><i /></button></div>
            <div className="el-rollout"><span>Rollout</span><b>75%</b></div>
            <div className="el-progress"><i /></div>
            <div className="el-segments"><span>All users</span><span>Beta customers</span><span>Internal team</span></div>
          </FloatCard>
        </div>
      </RevealSection>

      <RevealSection className="el-feature-row reverse el-shell" reverse>
        <div className="el-feature-copy">
          <div className="el-icon-box"><Sparkles size={23} /></div>
          <h3>Your data, your infrastructure.</h3>
          <p>Fully open-source and self-hostable. Run it on your own servers if data sovereignty or compliance matters to you — most flagging tools don&apos;t give you that option.</p>
          <Link href={primaryHref}>Explore experiments <ArrowRight size={17} /></Link>
        </div>
        <div className="el-visual result-surface">
          <FloatCard className="el-result-card">
            <small>EXPERIMENT RESULT</small><h4>Pricing page headline</h4>
            <div className="el-winner"><span>Variant B</span><b>+18.4%</b></div>
            <div className="el-confidence"><span>Statistical confidence</span><strong>97.6%</strong></div>
            <div className="el-confidence-bar"><i /></div>
            <button>Promote winner</button>
          </FloatCard>
        </div>
      </RevealSection>

      <RevealSection className="el-feature-row el-shell">
        <div className="el-feature-copy">
          <div className="el-icon-box"><Code2 size={23} /></div>
          <h3>Built for real production traffic.</h3>
          <p>Queued event ingestion absorbs traffic spikes, while deterministic SDK evaluation keeps flag checks fast and independent of the control plane.</p>
          <Link href="/app/sdk">Read the SDK guide <ArrowRight size={17} /></Link>
        </div>
        <div className="el-visual code-surface">
          <FloatCard className="el-code-card">
            <header><i /><i /><i /><span>checkout.tsx</span></header>
            <pre><code><span className="purple">const</span> enabled = <span className="blue">useFlag</span>(<span className="green">&quot;new_checkout&quot;</span>);{"\n\n"}<span className="purple">if</span> (enabled) {'{'}{"\n  "}<span className="purple">return</span> &lt;<span className="blue">NewCheckout</span> /&gt;;{"\n"}{'}'}{"\n\n"}<span className="purple">return</span> &lt;<span className="blue">ClassicCheckout</span> /&gt;;</code></pre>
            <footer><ShieldCheck size={16} /> Evaluated locally in &lt;0.05ms</footer>
          </FloatCard>
        </div>
      </RevealSection>

      <RevealSection id="pricing" className="el-pricing">
        <div className="el-shell">
          <h2>A community edition<br />you can run yourself.</h2>
          <div className="el-price-grid">
            <article>
              <span className="el-plan-name">Community</span><h3>$0<small>/month</small></h3><p>Feature flags, experiments, event ingestion, and self-hosting. No artificial limits.</p>
              <ul><li><Check /> Feature flags</li><li><Check /> A/B experiments</li><li><Check /> Queued event ingestion</li><li><Check /> Self-hosted</li></ul>
              <Link href={primaryHref} className="el-button el-button-ghost">Get started free</Link>
            </article>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="el-final-cta">
        <img className="el-logo-mark" src="/brand/experimentlab-mark.svg" alt="ExperimentLab" /><h2>Ship changes safely.<br />Test what matters. Own your data.</h2>
        <div className="el-hero-actions">
          <Link href={primaryHref} className="el-button el-button-primary">{userId ? "Open dashboard" : "Get started"}<ArrowRight size={18} /></Link>
          <a href="https://github.com/ignatius22/experimentlab" target="_blank" rel="noreferrer" className="el-button el-button-ghost"><Code2 size={18} /> View on GitHub</a>
        </div>
      </RevealSection>

      <footer className="el-footer">
        <div className="el-shell el-footer-grid">
          <div className="el-footer-brand"><div><img src="/brand/experimentlab-mark.svg" alt="" /><b>ExperimentLab</b></div><p>Feature flags and experimentation<br />for teams that keep learning.</p></div>
          <div><b>Product</b><Link href="#platform">Feature flags</Link><Link href="#platform">Experiments</Link><Link href="#pricing">Pricing</Link></div>
          <div><b>Developers</b><Link href="/docs/sdk-node">SDK guide</Link><a href="https://github.com/ignatius22/experimentlab">GitHub</a><Link href="/app/proof">Live sandbox</Link></div>
          <div><b>Account</b><Link href="/login">Sign in</Link><Link href="/signup">Create account</Link><Link href="/app">Dashboard</Link></div>
        </div>
        <div className="el-shell el-footer-bottom"><span>© 2026 ExperimentLab</span><span>Open source, built in public.</span></div>
      </footer>
    </div>
  );
}
