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
  // Interactions have no owner_id link, so there is no direct owner activity
  // feed — only the owner's yachts are related here.
  const { data: yachts } = await supabase
    .from("yachts")
    .select("id, name, status, price, type, hero_image, hero_color, hull_id")
    .eq("owner_id", id);
  return { yachts: (yachts ?? []) as Record<string, unknown>[] };
}
