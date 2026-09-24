"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type Notification = { id: string; title: string; detail: string; href: string; createdAt: string };

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [seenAt, setSeenAt] = useState<string | null>(null);

  useEffect(() => {
    setSeenAt(localStorage.getItem("experimentlab.notifications.seenAt"));
    fetch("/api/notifications").then((response) => response.ok ? response.json() : { notifications: [] }).then((data) => setItems(data.notifications || [])).catch(() => setItems([]));
  }, []);

  const unread = items.filter((item) => !seenAt || new Date(item.createdAt) > new Date(seenAt)).length;
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = new Date().toISOString();
      localStorage.setItem("experimentlab.notifications.seenAt", now);
      setSeenAt(now);
    }
  };

  return <div className="notifications">
    <button className="notifications-trigger" onClick={toggle} aria-label="Notifications" aria-expanded={open}><Bell size={17} />{unread > 0 && <span>{Math.min(unread, 9)}</span>}</button>
    {open && <div className="notifications-menu"><header><strong>Notifications</strong><small>Workspace activity</small></header>{items.length ? <div className="notifications-list">{items.map((item) => <Link href={item.href} key={item.id} onClick={() => setOpen(false)}><strong>{item.title}</strong><span>{item.detail}</span><time>{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></Link>)}</div> : <p className="notifications-empty">No new workspace activity.</p>}</div>}
  </div>;
}
