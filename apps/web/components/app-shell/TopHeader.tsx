"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Menu, Globe } from "lucide-react";

export function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname === "/app") return "Dashboard Overview";
    if (pathname.startsWith("/app/flags")) return "Feature Flags";
    if (pathname.startsWith("/app/experiments")) return "A/B Experiments";
    if (pathname.startsWith("/app/analytics")) return "Real-Time Telemetry Stream";
    if (pathname.startsWith("/app/performance")) return "Core Web Vitals Guardrails";
    if (pathname.startsWith("/app/proof")) return "Developer Proof Sandbox";
    if (pathname.startsWith("/app/sdk")) return "SDK Quickstart & Setup";
    if (pathname.startsWith("/app/settings")) return "Workspace Settings";
    return "Application Console";
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Console</span>
          <span className="text-xs text-slate-300 hidden sm:inline">/</span>
          <span className="text-xs font-bold text-slate-800 truncate max-w-[180px] sm:max-w-none">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <Globe size={13} className="text-slate-500" />
          <span>Landing Page</span>
        </Link>
        <Link
          href="/app/sdk"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
        >
          <Terminal size={13} className="text-blue-600" />
          <span>SDKs v0.1.1</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden xs:inline">Fleet</span> Online
        </div>
      </div>
    </header>
  );
}
