import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** All yachts with their (optional) listing row, for the internal manager. */
export async function listListings(supabase: SupabaseClient): Promise<any[]> {
  const { data } = await supabase
    .from("yachts")
    .select("id, name, type, status, price, lob, hero_image, listing:listings(headline, featured, status, share_token)")
    .order("name");
  return ((data ?? []) as any[]).map((y) => ({ ...y, listing: Array.isArray(y.listing) ? y.listing[0] ?? null : y.listing ?? null }));
}

export async function getListing(supabase: SupabaseClient, yachtId: string) {
  const [{ data: yacht }, { data: listing }, { data: media }] = await Promise.all([
    supabase.from("yachts").select("id, name, type, builder, year, loa_m, price, currency, lob, status, region, hero_image, specs").eq("id", yachtId).single(),
    supabase.from("listings").select("*").eq("yacht_id", yachtId).maybeSingle(),
    supabase.from("listing_media").select("*").eq("yacht_id", yachtId).order("position"),
  ]);
  return { yacht: yacht as any, listing: (listing ?? null) as any, media: (media ?? []) as any[] };
}

export async function listingStats(supabase: SupabaseClient) {
  const rows = await listListings(supabase);
  return {
    total: rows.length,
    published: rows.filter((r) => r.listing?.status === "published").length,
    featured: rows.filter((r) => r.listing?.featured).length,
    draft: rows.filter((r) => !r.listing || r.listing.status !== "published").length,
  };
}
