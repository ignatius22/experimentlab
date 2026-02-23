"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app/experiments", label: "Experiments" },
  { href: "/app/flags", label: "Flags" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/performance", label: "Performance" },
  { href: "/app/design-system", label: "Design System" },
  { href: "/app/proof", label: "Proof" }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }} aria-label="App Navigation">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{ fontWeight: pathname === link.href ? 700 : 500 }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
