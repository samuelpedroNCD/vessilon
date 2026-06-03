import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";

export type OfferFilters = { status?: string; kind?: string; q?: string };

export async function listOffers(supabase: SupabaseClient, f: OfferFilters = {}) {
  let query = supabase
    .from("offers")
    .select(
      "id, party, kind, amount, currency, conditions, response_deadline, status, responded_at, created_at, opportunity:opportunities(id, title, yacht:yachts(name), client:clients(name))",
    )
    .order("created_at", { ascending: false });
  if (f.status) query = query.eq("status", f.status);
  if (f.kind) query = query.eq("kind", f.kind);
  const term = sanitizeSearch(f.q);
  if (term) query = query.ilike("party", `%${term}%`);
  const { data } = await query;
  return (data ?? []) as unknown as Record<string, unknown>[];
}

export async function offerStats(supabase: SupabaseClient) {
  const { data } = await supabase.from("offers").select("amount, status");
  const rows = (data ?? []) as { amount: number | null; status: string }[];
  const live = rows.filter((r) => ["open", "countered"].includes(r.status));
  return {
    total: rows.length,
    open: live.length,
    accepted: rows.filter((r) => r.status === "accepted").length,
    rejected: rows.filter((r) => ["rejected", "withdrawn", "expired"].includes(r.status)).length,
    liveValue: live.reduce((s, r) => s + (r.amount ?? 0), 0),
  };
}

export const OFFER_STATUSES = ["open", "countered", "accepted", "rejected", "withdrawn", "expired"] as const;
export const OFFER_KINDS = ["offer", "counter", "loi"] as const;

/** Open opportunities for the standalone "new offer" picker. */
export async function dealOptions(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("opportunities")
    .select("id, title")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as { id: string; title: string }[];
}
