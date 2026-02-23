import Link from "next/link";

export default function AppHome() {
  return (
    <section className="stack">
      <h2>Authenticated Shell</h2>
      <p>Use the sections below to review the core engineering capabilities.</p>
      <div className="grid">
        <Link href="/app/experiments">Manage experiments</Link>
        <Link href="/app/flags">Toggle feature flags</Link>
        <Link href="/app/proof">Open proof dashboard</Link>
      </div>
    </section>
  );
}
