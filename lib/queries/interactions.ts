import type { SupabaseClient } from "@supabase/supabase-js";

export async function listInteractions(supabase: SupabaseClient, f: { type?: string }) {
  let query = supabase
    .from("interactions")
    .select("id, type, notes, outcome, occurred_at, broker:profiles!broker_id(full_name), client:clients(id, name), lead:leads(id, name), yacht:yachts(id, name)")
    .order("occurred_at", { ascending: false })
    .limit(60);
  if (f.type) query = query.eq("type", f.type);
  const { data } = await query;
  return (data ?? []) as Record<string, unknown>[];
}
