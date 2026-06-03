import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type SearchHit = { type: string; label: string; sub: string; href: string };
export type SearchGroup = { type: string; items: SearchHit[] };

/** Cross-entity search, org-scoped via RLS. Returns grouped hits. */
export async function globalSearch(supabase: SupabaseClient, raw: string): Promise<SearchGroup[]> {
  const term = sanitizeSearch(raw);
  if (!term || term.length < 2) return [];
  const like = `%${term}%`;

  const [yachts, leads, clients, opps, owners, companies] = await Promise.all([
    supabase.from("yachts").select("id, name, builder, hull_id").or(`name.ilike.${like},hull_id.ilike.${like},builder.ilike.${like}`).limit(6),
    supabase.from("leads").select("id, name, email").or(`name.ilike.${like},email.ilike.${like}`).limit(6),
    supabase.from("clients").select("id, name, email").or(`name.ilike.${like},email.ilike.${like}`).limit(6),
    supabase.from("opportunities").select("id, title, lob").ilike("title", like).limit(6),
    supabase.from("owners").select("id, name").ilike("name", like).limit(5),
    supabase.from("companies").select("id, name, country").ilike("name", like).limit(5),
  ]);

  const groups: SearchGroup[] = [
    { type: "Fleet", items: (yachts.data ?? []).map((y: any) => ({ type: "Yacht", label: y.name, sub: [y.builder, y.hull_id].filter(Boolean).join(" · "), href: `/fleet/${y.id}` })) },
    { type: "Pipeline", items: (opps.data ?? []).map((o: any) => ({ type: "Deal", label: o.title, sub: o.lob ?? "", href: `/pipeline/${o.id}` })) },
    { type: "Leads", items: (leads.data ?? []).map((l: any) => ({ type: "Lead", label: l.name ?? "—", sub: l.email ?? "", href: `/leads/${l.id}` })) },
    { type: "Clients", items: (clients.data ?? []).map((c: any) => ({ type: "Client", label: c.name, sub: c.email ?? "", href: `/clients/${c.id}` })) },
    { type: "Owners", items: (owners.data ?? []).map((o: any) => ({ type: "Owner", label: o.name, sub: "", href: `/owners/${o.id}` })) },
    { type: "Companies", items: (companies.data ?? []).map((c: any) => ({ type: "Company", label: c.name, sub: c.country ?? "", href: `/companies/${c.id}` })) },
  ];
  return groups.filter((g) => g.items.length > 0);
}
