import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";

export async function listOwners(supabase: SupabaseClient, f: { q?: string }) {
  let query = supabase.from("owners").select("id, name, email, phone, yachts:yachts(count)").order("name");
  const term = sanitizeSearch(f.q);
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  const { data } = await query;
  return (data ?? []) as unknown as OwnerRow[];
}

export type OwnerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  yachts: { count: number }[];
};

export async function getOwner(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("owners").select("*").eq("id", id).single();
  return data as Record<string, unknown> | null;
}

export async function getOwnerRelations(supabase: SupabaseClient, id: string) {
  const [yachts, interactions] = await Promise.all([
    supabase.from("yachts").select("id, name, status, price, hero_color, hull_id").eq("owner_id", id),
    supabase.from("interactions").select("id, type, notes, occurred_at").eq("client_id", id).order("occurred_at", { ascending: false }).limit(8),
  ]);
  return { yachts: (yachts.data ?? []) as Record<string, unknown>[], interactions: (interactions.data ?? []) as Record<string, unknown>[] };
}
