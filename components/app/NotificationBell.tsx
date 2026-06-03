"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsSeen } from "@/lib/actions/notifications";

type Notif = { id: string; kind: string; title: string; sub: string; href: string; ts: string; tone: "danger" | "warn" | "info" };

function rel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const j = await res.json();
      setItems(j.items ?? []);
      setUnread(j.unread ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async () => {
    await markNotificationsSeen();
    setUnread(0);
  };

  return (
    <div className="notif">
      <button className="nav-btn" aria-label="Notifications" onClick={() => { setOpen((o) => !o); if (!open) markRead(); }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 7a5 5 0 0110 0v3l1 2H2l1-2V7zM6 14h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setOpen(false)} />
          <div className="notif-menu">
            <div className="notif-h">Notifications{items.length > 0 && <span>{items.length}</span>}</div>
            {items.length === 0 ? (
              <div className="notif-empty">You&rsquo;re all caught up.</div>
            ) : (
              <div className="notif-list">
                {items.map((n) => (
                  <button key={n.id} className="notif-item" onClick={() => { setOpen(false); router.push(n.href); }}>
                    <span className={`notif-dot ${n.tone}`} />
                    <span className="notif-body">{n.title}<small>{n.sub}</small></span>
                    <span className="notif-ts">{rel(n.ts)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
