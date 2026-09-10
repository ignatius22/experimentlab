"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; orgName: string; orgId: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser({ email: data.user.email, orgName: data.user.orgName, orgId: data.user.orgId });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/app" },
    { label: "Flags", href: "/app/flags" },
    { label: "Experiments", href: "/app/experiments" },
    { label: "Analytics", href: "/app/analytics" },
    { label: "Performance", href: "/app/performance" },
    { label: "Proof Sandbox", href: "/app/proof" },
    { label: "SDK Guide", href: "/app/sdk" }
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link href="/app" className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:opacity-90 transition">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/20">
            🧪
          </span>
          <span className="text-base tracking-tight">ExperimentLab</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300">
              🏢 {user.orgName}
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
