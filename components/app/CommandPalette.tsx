"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Hit = { type: string; label: string; sub: string; href: string };
type Group = { type: string; items: Hit[] };

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // flat list of hits for keyboard nav
  const flat = groups.flatMap((g) => g.items);

  const close = useCallback(() => { setOpen(false); setQ(""); setGroups([]); setActive(0); }, []);

  // ⌘K / Ctrl-K toggles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 20); }, [open]);

  // debounced fetch
  useEffect(() => {
    if (!open) return;
    if (q.trim().length < 2) { setGroups([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setGroups(json.groups ?? []);
        setActive(0);
      } finally { setLoading(false); }
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  const go = (href: string) => { close(); router.push(href); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && flat[active]) { e.preventDefault(); go(flat[active].href); }
  };

  let idx = -1;
  return (
    <>
      <button className="cmdk" onClick={() => setOpen(true)} aria-label="Search">
        <svg className="ico" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
          <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Find vessel, listing, agent, owner…
        <span className="kbd"><span>⌘</span><span>K</span></span>
      </button>

      {open && (
        <div className="cmdk-overlay" onClick={close}>
          <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="cmdk-input"
              placeholder="Search vessels, deals, leads, clients, owners…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="cmdk-results">
              {loading && <div className="cmdk-empty">Searching…</div>}
              {!loading && q.trim().length >= 2 && flat.length === 0 && <div className="cmdk-empty">No matches.</div>}
              {!loading && q.trim().length < 2 && <div className="cmdk-empty">Type at least 2 characters.</div>}
              {groups.map((g) => (
                <div className="cmdk-group" key={g.type}>
                  <div className="cmdk-group-h">{g.type}</div>
                  {g.items.map((h) => {
                    idx++;
                    const i = idx;
                    return (
                      <button key={h.href} className={`cmdk-hit${i === active ? " active" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => go(h.href)}>
                        <span className="cmdk-type">{h.type}</span>
                        <span className="cmdk-label">{h.label}{h.sub ? <small>{h.sub}</small> : null}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
