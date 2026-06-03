import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";

export type ClientFilters = { q?: string; temperature?: string; category?: string };

export async function listClients(supabase: SupabaseClient, f: ClientFilters) {
  let query = supabase
    .from("clients")
    .select("id, name, email, phone, categories, temperature, last_interaction_at, source, broker:profiles!assigned_broker(full_name), company:companies(name)")
    .order("created_at", { ascending: false });
  if (f.temperature) query = query.eq("temperature", f.temperature);
  if (f.category) query = query.contains("categories", [f.category]);
  const term = sanitizeSearch(f.q);
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  const { data } = await query;
  return (data ?? []) as unknown as ClientRow[];
}

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  categories: string[];
  temperature: string | null;
  last_interaction_at: string | null;
  source: string | null;
  broker: { full_name: string | null } | null;
  company: { name: string } | null;
};

export async function clientStats(supabase: SupabaseClient) {
  const { data } = await supabase.from("clients").select("categories, temperature");
  const rows = (data ?? []) as { categories: string[] | null; temperature: string | null }[];
  return {
    total: rows.length,
    hot: rows.filter((r) => r.temperature === "hot").length,
    buyers: rows.filter((r) => r.categories?.includes("buyer")).length,
    sellers: rows.filter((r) => r.categories?.includes("seller")).length,
  };
}

export async function getClient(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("clients")
    .select("*, broker:profiles!assigned_broker(id, full_name), company:companies(id, name)")
    .eq("id", id)
    .single();
  return data as Record<string, unknown> | null;
}

export async function getClientRelations(supabase: SupabaseClient, id: string) {
  const [opps, interactions, tasks, documents] = await Promise.all([
    supabase.from("opportunities").select("id, title, value, status, expected_close, stage:lob_stages(name), yacht:yachts(name)").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("interactions").select("id, type, notes, outcome, occurred_at").eq("client_id", id).order("occurred_at", { ascending: false }).limit(12),
    supabase.from("tasks").select("id, title, status, due_at, priority").eq("client_id", id).order("due_at"),
    supabase.from("documents").select("id, name, type, version").eq("client_id", id),
  ]);
  return {
    opps: (opps.data ?? []) as Record<string, unknown>[],
    interactions: (interactions.data ?? []) as Record<string, unknown>[],
    tasks: (tasks.data ?? []) as Record<string, unknown>[],
    documents: (documents.data ?? []) as Record<string, unknown>[],
  };
}

export async function clientOptions(supabase: SupabaseClient) {
  const { data } = await supabase.from("clients").select("id, name").order("name");
  return (data ?? []) as { id: string; name: string }[];
}
