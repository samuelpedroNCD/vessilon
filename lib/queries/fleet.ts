import type { SupabaseClient } from "@supabase/supabase-js";

// Untyped client param (select strings not schema-validated) — consistent with
// lib/queries/overview.ts; pages pass the typed client, assignable here.

export type YachtFilters = { q?: string; status?: string; lob?: string; type?: string };

export async function listYachts(supabase: SupabaseClient, f: YachtFilters) {
  let query = supabase
    .from("yachts")
    .select(
      "id, name, type, builder, loa_m, year, price, currency, lob, status, region, hull_id, hero_color, broker:profiles!primary_broker(full_name)",
    )
    .order("name");
  if (f.status) query = query.eq("status", f.status);
  if (f.lob) query = query.eq("lob", f.lob);
  if (f.type) query = query.eq("type", f.type);
  if (f.q) query = query.or(`name.ilike.%${f.q}%,hull_id.ilike.%${f.q}%,builder.ilike.%${f.q}%`);
  const { data } = await query;
  return (data ?? []) as unknown as YachtRow[];
}

export type YachtRow = {
  id: string;
  name: string;
  type: string | null;
  builder: string | null;
  loa_m: number | null;
  year: number | null;
  price: number | null;
  currency: string | null;
  lob: string;
  status: string;
  region: string | null;
  hull_id: string | null;
  hero_color: string | null;
  broker: { full_name: string | null } | null;
};

export async function yachtStatusCounts(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data } = await supabase.from("yachts").select("status");
  const counts: Record<string, number> = {};
  for (const r of (data ?? []) as { status: string }[]) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export async function getYacht(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("yachts")
    .select(
      "*, broker:profiles!primary_broker(id, full_name, avatar_initials), owner:owners(id, name, email)",
    )
    .eq("id", id)
    .single();
  return data as Record<string, unknown> | null;
}

export async function getYachtRelations(supabase: SupabaseClient, id: string) {
  const [opps, interactions, documents, tasks] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, title, value, status, expected_close, stage:lob_stages(name), client:clients(id, name)")
      .eq("yacht_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("interactions")
      .select("id, type, notes, occurred_at")
      .eq("yacht_id", id)
      .order("occurred_at", { ascending: false })
      .limit(8),
    supabase.from("documents").select("id, name, type, version").eq("yacht_id", id),
    supabase.from("tasks").select("id, title, status, due_at, priority").eq("yacht_id", id).order("due_at"),
  ]);
  return {
    opps: (opps.data ?? []) as Record<string, unknown>[],
    interactions: (interactions.data ?? []) as Record<string, unknown>[],
    documents: (documents.data ?? []) as Record<string, unknown>[],
    tasks: (tasks.data ?? []) as Record<string, unknown>[],
  };
}

export async function brokerOptions(supabase: SupabaseClient) {
  const { data } = await supabase.from("profiles").select("id, full_name").order("full_name");
  return (data ?? []) as { id: string; full_name: string | null }[];
}

export async function ownerOptions(supabase: SupabaseClient) {
  const { data } = await supabase.from("owners").select("id, name").order("name");
  return (data ?? []) as { id: string; name: string }[];
}
