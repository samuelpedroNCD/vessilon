import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";

export type CompanyFilters = { q?: string; type?: string };

export async function listCompanies(supabase: SupabaseClient, f: CompanyFilters) {
  let query = supabase
    .from("companies")
    .select("id, name, type, country, website, clients:clients(count), owners:owners(count)")
    .order("name");
  if (f.type) query = query.eq("type", f.type);
  const term = sanitizeSearch(f.q);
  if (term) query = query.or(`name.ilike.%${term}%,country.ilike.%${term}%`);
  const { data } = await query;
  return (data ?? []) as unknown as CompanyRow[];
}

export type CompanyRow = {
  id: string;
  name: string;
  type: string;
  country: string | null;
  website: string | null;
  clients: { count: number }[];
  owners: { count: number }[];
};

export async function companyStats(supabase: SupabaseClient) {
  const { data } = await supabase.from("companies").select("type");
  const rows = (data ?? []) as { type: string }[];
  return {
    total: rows.length,
    clients: rows.filter((r) => r.type === "client").length,
    owners: rows.filter((r) => r.type === "owner").length,
    partners: rows.filter((r) => r.type === "partner").length,
  };
}

export async function getCompany(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("companies").select("*").eq("id", id).single();
  return data as Record<string, unknown> | null;
}

export async function getCompanyRelations(supabase: SupabaseClient, id: string) {
  const [clients, owners] = await Promise.all([
    supabase.from("clients").select("id, name, temperature, categories").eq("company_id", id),
    supabase.from("owners").select("id, name, email").eq("company_id", id),
  ]);
  return {
    clients: (clients.data ?? []) as Record<string, unknown>[],
    owners: (owners.data ?? []) as Record<string, unknown>[],
  };
}

export async function companyOptions(supabase: SupabaseClient) {
  const { data } = await supabase.from("companies").select("id, name").order("name");
  return (data ?? []) as { id: string; name: string }[];
}
