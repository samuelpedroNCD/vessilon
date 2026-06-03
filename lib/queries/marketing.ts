import type { SupabaseClient } from "@supabase/supabase-js";

export type Brochure = {
  id: string;
  type: string;
  status: string;
  share_token: string | null;
  generated_at: string | null;
};
export type MarketingYacht = {
  id: string;
  name: string;
  type: string | null;
  status: string;
  price: number | null;
  builder: string | null;
  year: number | null;
  hero_image: string | null;
  lob: string;
  brochures: Brochure[];
};

export async function listMarketing(supabase: SupabaseClient, orgId: string): Promise<MarketingYacht[]> {
  const [{ data: yachts }, { data: brs }] = await Promise.all([
    supabase
      .from("yachts")
      .select("id, name, type, status, price, builder, year, hero_image, lob")
      .eq("org_id", orgId)
      .order("name"),
    supabase
      .from("brochures")
      .select("id, yacht_id, type, status, share_token, generated_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false }),
  ]);

  const byYacht = new Map<string, Brochure[]>();
  for (const b of (brs ?? []) as Array<Brochure & { yacht_id: string }>) {
    const arr = byYacht.get(b.yacht_id) ?? [];
    arr.push({ id: b.id, type: b.type, status: b.status, share_token: b.share_token, generated_at: b.generated_at });
    byYacht.set(b.yacht_id, arr);
  }

  return ((yachts ?? []) as unknown as Omit<MarketingYacht, "brochures">[]).map((y) => ({
    ...y,
    brochures: byYacht.get(y.id) ?? [],
  }));
}

export const BROCHURE_TYPES = ["sale", "charter", "full_spec", "co_ownership", "one_page"] as const;
