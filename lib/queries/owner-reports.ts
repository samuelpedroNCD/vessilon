import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function listOwnerReports(supabase: SupabaseClient): Promise<any[]> {
  const { data } = await supabase
    .from("owner_reports")
    .select("id, title, status, period_start, period_end, generated_at, share_token, owner:owners(name), yacht:yachts(name)")
    .order("created_at", { ascending: false });
  return (data ?? []) as any[];
}

export async function getOwnerReport(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("owner_reports")
    .select("*, owner:owners(id, name), yacht:yachts(id, name)")
    .eq("id", id)
    .single();
  return data as any;
}

/** Compile real activity metrics for an owner's fleet over a period. */
export async function computeOwnerMetrics(supabase: SupabaseClient, ownerId: string): Promise<Record<string, number>> {
  const { data: yachts } = await supabase.from("yachts").select("id, price, created_at").eq("owner_id", ownerId);
  const ids = (yachts ?? []).map((y: any) => y.id);
  if (ids.length === 0) return { vessels: 0, listings: 0, enquiries: 0, openDeals: 0, weightedPipeline: 0, charters: 0, avgDaysOnMarket: 0 };

  const [{ data: listings }, { data: ix }, { data: opps }, { data: charters }] = await Promise.all([
    supabase.from("listings").select("id").in("yacht_id", ids).eq("status", "published"),
    supabase.from("interactions").select("id").in("yacht_id", ids),
    supabase.from("opportunities").select("value, probability, status, stage:lob_stages(probability)").in("yacht_id", ids),
    supabase.from("charters").select("id").in("yacht_id", ids),
  ]);

  const open = ((opps ?? []) as any[]).filter((o) => o.status === "open");
  const weighted = open.reduce((s, o) => s + (o.value ?? 0) * ((o.probability ?? o.stage?.probability ?? 0) / 100), 0);
  const dom = (yachts ?? []).reduce((s: number, y: any) => s + Math.max(0, Math.round((Date.now() - new Date(y.created_at).getTime()) / 86400000)), 0);

  return {
    vessels: ids.length,
    listings: (listings ?? []).length,
    enquiries: (ix ?? []).length,
    openDeals: open.length,
    weightedPipeline: Math.round(weighted),
    charters: (charters ?? []).length,
    avgDaysOnMarket: ids.length ? Math.round(dom / ids.length) : 0,
  };
}
