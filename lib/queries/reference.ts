import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";

export async function listRef(supabase: SupabaseClient, table: string, q?: string) {
  let query = supabase.from(table).select("*").order("name");
  const term = sanitizeSearch(q);
  if (term) query = query.ilike("name", `%${term}%`);
  const { data } = await query;
  return (data ?? []) as Record<string, unknown>[];
}

export async function getRef(supabase: SupabaseClient, table: string, id: string) {
  const { data } = await supabase.from(table).select("*").eq("id", id).single();
  return data as Record<string, unknown> | null;
}
