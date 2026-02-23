import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ExperimentLab | Feature Flag & Experimentation SaaS",
  description: "Run A/B tests, ship flags safely, and measure performance from one control plane.",
  alternates: { canonical: "https://example.com/" },
  openGraph: {
    title: "ExperimentLab",
    description: "Feature flags, experimentation, and analytics in one product-grade demo.",
    url: "https://example.com/"
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ExperimentLab",
  applicationCategory: "BusinessApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
};

export default function MarketingPage() {
  return (
    <main className="container stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>ExperimentLab</h1>
      <p>Portfolio-grade SaaS demo for flags, experiments, analytics, and Core Web Vitals observability.</p>
      <div className="grid">
        <Link href="/login" className="card-link">Login</Link>
        <Link href="/app" className="card-link">Open App</Link>
        <Link href="/app/proof" className="card-link">Proof Dashboard</Link>
      </div>
    </main>
  );
}
