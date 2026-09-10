"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Flag, 
  FlaskConical, 
  BarChart3, 
  Activity, 
  Beaker, 
  BookOpen, 
  LogOut, 
  ShieldCheck, 
  Building2,
  ChevronRight,
  X,
  ExternalLink,
  Settings
} from "lucide-react";

export function AppSidebar({ onClose }: { onClose?: () => void }) {
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

  const navSections = [
    {
      title: "Core Platform",
      items: [
        { label: "Dashboard", href: "/app", icon: LayoutDashboard },
        { label: "Feature Flags", href: "/app/flags", icon: Flag },
        { label: "A/B Experiments", href: "/app/experiments", icon: FlaskConical },
      ]
    },
    {
      title: "Observability & Guardrails",
      items: [
        { label: "Analytics Stream", href: "/app/analytics", icon: BarChart3 },
        { label: "Performance (CWV)", href: "/app/performance", icon: Activity },
      ]
    },
    {
      title: "Developer Tools",
      items: [
        { label: "Proof Sandbox", href: "/app/proof", icon: Beaker },
        { label: "SDK Documentation", href: "/app/sdk", icon: BookOpen },
        { label: "Settings", href: "/app/settings", icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shadow-sm">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link 
            href="/app" 
            onClick={onClose}
            className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 hover:opacity-90 transition"
          >
            <span style={{ fontSize: "1.6rem" }}>🧪</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight">ExperimentLab</span>
              <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Console Fleet</span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Organization / Environment Selector */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 size={15} className="text-blue-600 flex-shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.orgName || "Core Engineering"}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">Org ID: {user?.orgId?.slice(0, 10) || "cmtcwyy..."}...</p>
              </div>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-blue-600" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile & Actions */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-800 truncate">{user?.email || "admin@experimentlab.dev"}</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500" /> Admin Role
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
