import type { SupabaseClient } from "@supabase/supabase-js";

export type LeadFilters = { q?: string; status?: string; lob?: string; temperature?: string };

export async function listLeads(supabase: SupabaseClient, f: LeadFilters) {
  let query = supabase
    .from("leads")
    .select("id, name, email, phone, lob, status, temperature, source, ai_confidence, converted_client_id, broker:profiles!assigned_broker(full_name)")
    .order("created_at", { ascending: false });
  if (f.status) query = query.eq("status", f.status);
  if (f.lob) query = query.eq("lob", f.lob);
  if (f.temperature) query = query.eq("temperature", f.temperature);
  if (f.q) query = query.or(`name.ilike.%${f.q}%,email.ilike.%${f.q}%`);
  const { data } = await query;
  return (data ?? []) as unknown as LeadRow[];
}

export type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  lob: string | null;
  status: string;
  temperature: string | null;
  source: string | null;
  ai_confidence: number | null;
  converted_client_id: string | null;
  broker: { full_name: string | null } | null;
};

export async function getLead(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("leads")
    .select("*, broker:profiles!assigned_broker(id, full_name)")
    .eq("id", id)
    .single();
  return data as Record<string, unknown> | null;
}

export async function getLeadRelations(supabase: SupabaseClient, id: string) {
  const [interactions, opps] = await Promise.all([
    supabase.from("interactions").select("id, type, notes, occurred_at").eq("lead_id", id).order("occurred_at", { ascending: false }).limit(10),
    supabase.from("opportunities").select("id, title, value, status, stage:lob_stages(name)").eq("lead_id", id),
  ]);
  return { interactions: (interactions.data ?? []) as Record<string, unknown>[], opps: (opps.data ?? []) as Record<string, unknown>[] };
}
