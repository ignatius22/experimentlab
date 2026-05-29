"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { 
  FlaskConical, 
  Flag, 
  BarChart3, 
  Zap, 
  ShieldCheck,
  User
} from "lucide-react";

const links = [
  { href: "/app/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/app/flags", label: "Feature Flags", icon: Flag },
  { href: "/app/analytics", label: "Event Stream", icon: BarChart3 },
  { href: "/app/performance", label: "Performance", icon: Zap },
  { href: "/app/proof", label: "Proof Dashboard", icon: ShieldCheck }
];

interface AppNavProps {
  orientation?: "horizontal" | "vertical";
}

export function AppNav({ orientation = "horizontal" }: AppNavProps) {
  const pathname = usePathname();
  const isVertical = orientation === "vertical";

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      height: "100%",
      justifyContent: "space-between",
      paddingTop: isVertical ? 24 : 0
    }}>
      <nav style={{ 
        display: "flex", 
        flexDirection: isVertical ? "column" : "row", 
        gap: 4 
      }} aria-label="App Navigation">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`ui-sidebar-link ${active ? "ui-sidebar-link-active" : ""}`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ 
        marginTop: "auto",
        paddingTop: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        borderTop: "1px solid rgba(255,255,255,0.1)"
      }}>
        <OrganizationSwitcher 
          hidePersonal 
          afterCreateOrganizationUrl="/app"
          appearance={{
            elements: {
              rootBox: { width: "100%" },
              organizationSwitcherTrigger: { 
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,255,255,0.1)"
              }
            }
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
          <UserButton />
          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 8 }}>
             Account
          </span>
        </div>
      </div>
    </div>
  );
}
