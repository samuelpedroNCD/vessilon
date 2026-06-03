import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type CalEvent = { date: string; kind: string; title: string; href: string; tone: "ok" | "warn" | "danger" | "info" | "gray" };

function ym(d: Date) { return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`; }

/** Parse ?m=YYYY-MM (default current month) → bounds + grid metadata. */
export function monthMeta(m?: string) {
  const now = new Date();
  const match = m && /^\d{4}-\d{2}$/.test(m) ? m : ym(now);
  const [y, mo] = match.split("-").map(Number);
  const first = new Date(Date.UTC(y, mo - 1, 1));
  const start = first.toISOString().slice(0, 10);
  const end = new Date(Date.UTC(y, mo, 0)).toISOString().slice(0, 10); // last day
  const prev = ym(new Date(Date.UTC(y, mo - 2, 1)));
  const next = ym(new Date(Date.UTC(y, mo, 1)));
  const label = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const firstWeekday = (first.getUTCDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return { match, y, mo, start, end, prev, next, label, firstWeekday, daysInMonth };
}

/** Aggregate dated records across modules into calendar events for a month. */
export async function getCalendar(supabase: SupabaseClient, m?: string): Promise<{ meta: ReturnType<typeof monthMeta>; events: Record<string, CalEvent[]> }> {
  const meta = monthMeta(m);
  const { start, end } = meta;
  const endT = `${end}T23:59:59`;

  const [tasks, charters, deals, vcerts, ccerts] = await Promise.all([
    supabase.from("tasks").select("id, title, due_at, status").gte("due_at", `${start}T00:00:00`).lte("due_at", endT).not("status", "in", "(completed,cancelled)"),
    supabase.from("charters").select("id, start_on, end_on, status, yacht:yachts(name)").or(`and(start_on.gte.${start},start_on.lte.${end}),and(end_on.gte.${start},end_on.lte.${end})`),
    supabase.from("opportunities").select("id, title, expected_close, closing_date").or(`and(expected_close.gte.${start},expected_close.lte.${end}),and(closing_date.gte.${start},closing_date.lte.${end})`),
    supabase.from("vessel_certificates").select("id, name, expires_on, yacht:yachts(name)").gte("expires_on", start).lte("expires_on", end),
    supabase.from("crew_certificates").select("id, name, expires_on, crew:crew(id, name)").gte("expires_on", start).lte("expires_on", end),
  ]);

  const events: Record<string, CalEvent[]> = {};
  const push = (date: string | null, e: Omit<CalEvent, "date">) => {
    if (!date) return;
    const day = date.slice(0, 10);
    (events[day] ??= []).push({ date: day, ...e });
  };

  for (const t of (tasks.data ?? []) as any[]) push(t.due_at, { kind: "task", title: t.title, href: "/tasks", tone: "warn" });
  for (const c of (charters.data ?? []) as any[]) {
    push(c.start_on, { kind: "charter", title: `${c.yacht?.name ?? "Charter"} starts`, href: `/charters/${c.id}`, tone: "info" });
    if (c.end_on && c.end_on >= start && c.end_on <= end) push(c.end_on, { kind: "charter", title: `${c.yacht?.name ?? "Charter"} ends`, href: `/charters/${c.id}`, tone: "info" });
  }
  for (const d of (deals.data ?? []) as any[]) {
    push(d.closing_date, { kind: "closing", title: `Closing · ${d.title}`, href: `/closings/${d.id}`, tone: "ok" });
    if (d.expected_close && d.expected_close !== d.closing_date) push(d.expected_close, { kind: "deal", title: `Target close · ${d.title}`, href: `/pipeline/${d.id}`, tone: "gray" });
  }
  for (const c of (vcerts.data ?? []) as any[]) push(c.expires_on, { kind: "cert", title: `${c.yacht?.name ?? "Vessel"} · ${c.name} expires`, href: "/compliance", tone: "danger" });
  for (const c of (ccerts.data ?? []) as any[]) push(c.expires_on, { kind: "cert", title: `${c.crew?.name ?? "Crew"} · ${c.name} expires`, href: c.crew?.id ? `/crew/${c.crew.id}` : "/crew", tone: "danger" });

  return { meta, events };
}
