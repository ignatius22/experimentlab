"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

export function MarketingNavbar({ userId }: { userId: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="el-nav">
      <div className="el-shell el-nav-inner">
        <Link href="/" className="el-brand"><img src="/brand/experimentlab-mark.svg" alt="" />ExperimentLab</Link>
        <nav className={open ? "open" : ""}>
          <a href="/#platform" onClick={() => setOpen(false)}>Platform</a>
          <a href="/#pricing" onClick={() => setOpen(false)}>Pricing</a>
          <Link href="/docs/sdk-node" onClick={() => setOpen(false)}>Developers</Link>
          <a href="https://github.com/ignatius22/experimentlab" target="_blank" rel="noreferrer">Open source</a>
          <div className="el-mobile-actions">
            <Link href="/login">Log in</Link>
            <Link href={userId ? "/app" : "/signup"} className="el-button el-button-primary">{userId ? "Dashboard" : "Start free"}</Link>
          </div>
        </nav>
        <div className="el-nav-actions">
          {!userId && <Link href="/login" className="el-login">Log in</Link>}
          <Link href={userId ? "/app" : "/signup"} className="el-button el-button-primary">{userId ? "Dashboard" : "Start free"}<ArrowRight size={16} /></Link>
        </div>
        <button className="el-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}
