"use client";

import Link from "next/link";
import { Beaker } from "lucide-react";
import { Button } from "@experiment/ui";
import { UserButton, useAuth } from "@clerk/nextjs";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <header style={{ 
        borderBottom: "1px solid var(--color-border)",
        padding: "0 var(--space-8)",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Beaker size={28} color="var(--color-accent)" />
          <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>ExperimentLab</span>
        </div>
        
        <nav style={{ display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            <Link href="/" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--color-text)" }}>Features</Link>
            <Link href="/" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--color-text-muted)" }}>SDK</Link>
            <Link href="/" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--color-text-muted)" }}>Pricing</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isLoaded && (
              <>
                {!isSignedIn ? (
                  <>
                    <Link href="/login">
                      <Button variant="secondary" style={{ border: "none" }}>Sign In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button>Get Started</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/app">
                      <Button variant="secondary" style={{ border: "none" }}>Dashboard</Button>
                    </Link>
                    <UserButton />
                  </>
                )}
              </>
            )}
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer style={{ 
        padding: "var(--space-12) var(--space-8)", 
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        textAlign: "center"
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <Beaker size={20} color="var(--color-text-dim)" />
          <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>ExperimentLab</span>
        </div>
        <p style={{ color: "var(--color-text-dim)", fontSize: "0.9rem" }}>
          © 2026 ExperimentLab SaaS. Built for high-performance engineering teams.
        </p>
      </footer>
    </div>
  );
}
