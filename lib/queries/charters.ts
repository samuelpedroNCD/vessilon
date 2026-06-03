import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function listCharters(supabase: SupabaseClient, f: { status?: string } = {}): Promise<any[]> {
  let query = supabase
    .from("charters")
    .select("id, start_on, end_on, gross_fee, apa, currency, status, destination, guests, yacht:yachts(id, name), client:clients(id, name)")
    .order("start_on", { ascending: true, nullsFirst: false });
  if (f.status) query = query.eq("status", f.status);
  const { data } = await query;
  return (data ?? []) as any[];
}

export async function charterStats(supabase: SupabaseClient) {
  const { data } = await supabase.from("charters").select("status, gross_fee, start_on");
  const rows = (data ?? []) as { status: string; gross_fee: number | null; start_on: string | null }[];
  const today = new Date().toISOString().slice(0, 10);
  const booked = rows.filter((r) => ["confirmed", "option"].includes(r.status));
  return {
    total: rows.length,
    confirmed: rows.filter((r) => r.status === "confirmed").length,
    upcoming: booked.filter((r) => r.start_on && r.start_on >= today).length,
    grossFees: booked.reduce((s, r) => s + (r.gross_fee ?? 0), 0),
  };
}

export async function getCharter(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("charters")
    .select("*, yacht:yachts(id, name), client:clients(id, name), broker_p:profiles!broker(full_name)")
    .eq("id", id)
    .single();
  return data as any;
}

/** Group charters by "Mon YYYY" of their start date for the timeline view. */
export function groupByMonth(charters: any[]): { key: string; label: string; items: any[] }[] {
  const groups = new Map<string, { label: string; items: any[] }>();
  for (const c of charters) {
    const key = c.start_on ? c.start_on.slice(0, 7) : "0000-00";
    const label = c.start_on ? new Date(c.start_on).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Unscheduled";
    const g = groups.get(key) ?? { label, items: [] };
    g.items.push(c);
    groups.set(key, g);
  }
  return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([key, v]) => ({ key, ...v }));
}

export const CHARTER_STATUSES = ["enquiry", "option", "confirmed", "completed", "cancelled"] as const;
