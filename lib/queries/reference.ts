import type { SupabaseClient } from "@supabase/supabase-js";

export async function listRef(supabase: SupabaseClient, table: string, q?: string) {
  let query = supabase.from(table).select("*").order("name");
  if (q) query = query.ilike("name", `%${q}%`);
  const { data } = await query;
  return (data ?? []) as Record<string, unknown>[];
}

export async function getRef(supabase: SupabaseClient, table: string, id: string) {
  const { data } = await supabase.from(table).select("*").eq("id", id).single();
  return data as Record<string, unknown> | null;
}
