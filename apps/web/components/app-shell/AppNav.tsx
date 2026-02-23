"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getSession, SESSION_KEY, type Session } from "@/lib/auth/session";

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
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(() => getSession());

  useEffect(() => {
    setSession(getSession());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_KEY) return;
      setSession(getSession());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
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
      {session ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 999,
            background: "#ecfeff"
          }}
        >
          <span style={{ fontSize: 12 }}>Signed in: {session.userId}</span>
          <button
            onClick={() => {
              clearSession();
              setSession(null);
              router.replace("/login");
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
