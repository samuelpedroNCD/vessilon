import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/queries/profile";
import { certStatus } from "@/lib/certs";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Notif = { id: string; kind: string; title: string; sub: string; href: string; ts: string; tone: "danger" | "warn" | "info" };

/** Derive notifications from real signals (no separate table). */
export async function getNotifications(supabase: SupabaseClient, profile: Profile): Promise<{ items: Notif[]; unread: number }> {
  const now = Date.now();
  const soon = new Date(now + 30 * 86400000).toISOString().slice(0, 10);
  const taskCut = new Date(now + 2 * 86400000).toISOString();

  const [tasks, vcerts, ccerts, offers, deals] = await Promise.all([
    supabase.from("tasks").select("id, title, due_at, status").eq("assignee", profile.id).not("status", "in", "(completed,cancelled)").not("due_at", "is", null).lte("due_at", taskCut).order("due_at").limit(15),
    supabase.from("vessel_certificates").select("id, name, expires_on, yacht:yachts(id, name)").not("expires_on", "is", null).lte("expires_on", soon).order("expires_on").limit(15),
    supabase.from("crew_certificates").select("id, name, expires_on, crew:crew(id, name)").not("expires_on", "is", null).lte("expires_on", soon).order("expires_on").limit(15),
    supabase.from("offers").select("id, party, kind, response_deadline, status, opportunity_id, created_at").eq("status", "open").not("response_deadline", "is", null).order("response_deadline").limit(15),
    supabase.from("opportunities").select("id, title, stage_entered_at, status, stage:lob_stages(name, sla_days)").eq("status", "open").limit(60),
  ]);

  const items: Notif[] = [];

  for (const t of (tasks.data ?? []) as any[]) {
    const overdue = new Date(t.due_at).getTime() < now;
    items.push({ id: `task-${t.id}`, kind: "task", title: t.title, sub: overdue ? "Task overdue" : "Task due soon", href: "/tasks", ts: t.due_at, tone: overdue ? "danger" : "warn" });
  }
  for (const c of (vcerts.data ?? []) as any[]) {
    const s = certStatus(c.expires_on);
    items.push({ id: `vc-${c.id}`, kind: "cert", title: `${c.yacht?.name ?? "Vessel"} · ${c.name}`, sub: s.label, href: "/compliance", ts: c.expires_on, tone: s.tone === "ok" ? "info" : (s.tone as any) });
  }
  for (const c of (ccerts.data ?? []) as any[]) {
    const s = certStatus(c.expires_on);
    items.push({ id: `cc-${c.id}`, kind: "cert", title: `${c.crew?.name ?? "Crew"} · ${c.name}`, sub: s.label, href: c.crew?.id ? `/crew/${c.crew.id}` : "/crew", ts: c.expires_on, tone: s.tone === "ok" ? "info" : (s.tone as any) });
  }
  for (const o of (offers.data ?? []) as any[]) {
    const overdue = new Date(o.response_deadline).getTime() < now;
    items.push({ id: `offer-${o.id}`, kind: "offer", title: `Offer · ${o.party ?? o.kind}`, sub: overdue ? "Response overdue" : "Response due", href: "/offers", ts: o.response_deadline, tone: overdue ? "danger" : "warn" });
  }
  for (const d of (deals.data ?? []) as any[]) {
    const sla = d.stage?.sla_days;
    if (!sla || !d.stage_entered_at) continue;
    const days = Math.floor((now - new Date(d.stage_entered_at).getTime()) / 86400000);
    if (days > sla) items.push({ id: `deal-${d.id}`, kind: "deal", title: d.title, sub: `${days}d in ${d.stage?.name} · SLA ${sla}d`, href: `/pipeline/${d.id}`, ts: d.stage_entered_at, tone: "warn" });
  }

  items.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const top = items.slice(0, 30);
  const seen = profile.notifications_seen_at ? new Date(profile.notifications_seen_at).getTime() : 0;
  const unread = top.filter((i) => new Date(i.ts).getTime() > seen).length;
  return { items: top, unread };
}
