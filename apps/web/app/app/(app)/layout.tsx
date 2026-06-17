"use client";

import { AppNav } from "@/components/app-shell/AppNav";
import { Beaker, Menu } from "lucide-react";
import { useState } from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="ui-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
          <Beaker size={24} color="var(--color-accent)" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>ExperimentLab</h2>
        </div>
        <AppNav orientation="vertical" />
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Beaker size={20} color="var(--color-accent)" />
          <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>ExperimentLab</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <OrganizationSwitcher hidePersonal />
          <UserButton />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: "transparent", border: "none", color: "var(--color-text)", cursor: "pointer" }}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
             <AppNav orientation="vertical" />
          </nav>
        </div>
      )}

      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .mobile-header {
          display: none;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 200;
        }

        .mobile-menu {
          width: 280px;
          height: 100%;
          background: var(--color-primary);
          padding: 24px;
        }

        @media (max-width: 1024px) {
          .mobile-header {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}

