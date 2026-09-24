"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart2, ChevronRight, CircleHelp, Code2, Ellipsis, Flag, FlaskConical, LayoutDashboard, LogOut, Menu, Settings, Terminal, UserRound, X } from "lucide-react";
import { NotificationsMenu } from "./NotificationsMenu";

const navigation = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Feature flags", href: "/app/flags", icon: Flag },
  { label: "Experiments", href: "/app/experiments", icon: FlaskConical },
  { label: "Analytics", href: "/app/analytics", icon: BarChart2 },
  { label: "Performance", href: "/app/performance", icon: Activity },
  { label: "SDK", href: "/app/sdk", icon: Terminal },
  { label: "Sandbox", href: "/app/proof", icon: Code2 }
];

const pageNames: Record<string, string> = {
  "/app": "Overview", "/app/flags": "Feature flags", "/app/experiments": "Experiments",
  "/app/analytics": "Analytics", "/app/performance": "Performance", "/app/sdk": "SDK",
  "/app/proof": "Sandbox", "/app/settings": "Settings"
};

export function CoupAppShell({ children, user }: { children: React.ReactNode; user: { email: string; name: string | null; orgName: string; orgId: string; plan: string } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const currentPage = Object.entries(pageNames).sort(([a], [b]) => b.length - a.length).find(([path]) => pathname === path || (path !== "/app" && pathname.startsWith(path)))?.[1] || "Workspace";
  const initials = (user?.email || "U").slice(0, 1).toUpperCase();
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return <div className="product-shell">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
    <aside className={`product-sidebar ${open ? "is-open" : ""}`}>
      <div className="product-sidebar-head">
        <Link href="/app" className="product-brand"><img src="/brand/experimentlab-mark.svg" alt="" /><span>ExperimentLab</span></Link>
        <button className="product-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button>
      </div>
      <div className="product-workspace"><span className="product-workspace-mark">{(user?.orgName || "W").slice(0, 1).toUpperCase()}</span><div><strong>{user?.orgName || "Workspace"}</strong><small>Community workspace</small></div></div>
      <nav className="product-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          return <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setOpen(false)}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span></Link>;
        })}
      </nav>
      <div className="product-account">
        {accountOpen && <div className="product-account-menu">
          <div className="account-summary"><span className="product-avatar">{initials}</span><div><strong>{displayName}</strong><small>{user?.plan === "team" ? "Team" : "Community"}</small></div><ChevronRight size={17} /></div>
          <div className="account-menu-links"><Link href="/app/settings#profile" onClick={() => setAccountOpen(false)}><UserRound size={18} /> Profile</Link><Link href="/app/settings" onClick={() => setAccountOpen(false)}><Settings size={18} /> Settings</Link></div>
          <div className="account-menu-links"><Link href="/app/sdk" onClick={() => setAccountOpen(false)}><CircleHelp size={18} /> Help <ChevronRight size={16} /></Link><button onClick={logout}><LogOut size={18} /> Log out</button></div>
        </div>}
        <button className="product-account-trigger" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen}><span className="product-avatar">{initials}</span><div><strong>{displayName}</strong><small>{user?.plan === "team" ? "Team" : "Community"}</small></div><Ellipsis size={18} /></button>
      </div>
    </aside>
    {open && <button className="product-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <div className="product-main">
      <header className="product-topbar"><button className="product-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><span>{currentPage}</span><div className="product-top-actions"><NotificationsMenu /><Link href="/app/settings#profile" className="product-top-avatar">{initials}</Link></div></header>
      <main className="product-content">{children}</main>
    </div>
  </div>;
}
