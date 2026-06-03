import type { SupabaseClient } from "@supabase/supabase-js";

export const LOBS = ["sale", "charter", "new_build", "co_ownership", "trade", "services"];

export async function getStages(supabase: SupabaseClient, lob: string) {
  const { data } = await supabase
    .from("lob_stages")
    .select("id, name, position, probability, is_won, is_lost, sla_days")
    .eq("lob", lob)
    .order("position");
  return (data ?? []) as Record<string, unknown>[];
}

export async function boardData(supabase: SupabaseClient, lob: string) {
  const { data } = await supabase
    .from("opportunities")
    .select("id, title, value, status, probability, expected_close, stage_id, yacht:yachts(name, hero_color), client:clients(name), lead:leads(name)")
    .eq("lob", lob)
    .order("created_at", { ascending: false });
  return (data ?? []) as Record<string, unknown>[];
}

export async function listOpportunities(supabase: SupabaseClient, f: { lob?: string; status?: string; q?: string }) {
  let query = supabase
    .from("opportunities")
    .select("id, title, lob, value, status, expected_close, stage:lob_stages(name), yacht:yachts(name), client:clients(name), broker:profiles!assigned_broker(full_name)")
    .order("created_at", { ascending: false });
  if (f.lob) query = query.eq("lob", f.lob);
  if (f.status) query = query.eq("status", f.status);
  if (f.q) query = query.ilike("title", `%${f.q}%`);
  const { data } = await query;
  return (data ?? []) as Record<string, unknown>[];
}

export async function pipelineStats(supabase: SupabaseClient) {
  const { data } = await supabase.from("opportunities").select("value, probability, status, stage:lob_stages(probability)");
  const rows = (data ?? []) as unknown as { value: number | null; probability: number | null; status: string; stage: { probability: number } | null }[];
  const open = rows.filter((r) => r.status === "open");
  return {
    weighted: open.reduce((s, o) => s + (o.value ?? 0) * ((o.probability ?? o.stage?.probability ?? 0) / 100), 0),
    gross: open.reduce((s, o) => s + (o.value ?? 0), 0),
    openCount: open.length,
    wonCount: rows.filter((r) => r.status === "won").length,
  };
}

export async function getOpportunity(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("opportunities")
    .select("*, stage:lob_stages(id, name, position, probability, is_won, is_lost, sla_days), yacht:yachts(id, name, hero_color, builder, loa_m, hull_id, price), client:clients(id, name), lead:leads(id, name), broker:profiles!assigned_broker(id, full_name)")
    .eq("id", id)
    .single();
  return data as Record<string, unknown> | null;
}

export async function getOpportunityRelations(supabase: SupabaseClient, id: string) {
  const [interactions, tasks, documents] = await Promise.all([
    supabase.from("interactions").select("id, type, notes, outcome, occurred_at, broker:profiles!broker_id(full_name)").eq("opportunity_id", id).order("occurred_at", { ascending: false }).limit(12),
    supabase.from("tasks").select("id, title, status, due_at").eq("opportunity_id", id).order("due_at"),
    supabase.from("documents").select("id, name, type").eq("opportunity_id", id),
  ]);
  return {
    interactions: (interactions.data ?? []) as Record<string, unknown>[],
    tasks: (tasks.data ?? []) as Record<string, unknown>[],
    documents: (documents.data ?? []) as Record<string, unknown>[],
  };
}

export async function getDealExtras(supabase: SupabaseClient, id: string) {
  const [events, offers, checklist] = await Promise.all([
    supabase.from("opportunity_events").select("id, kind, from_stage, to_stage, note, created_at, actor:profiles!actor(full_name)").eq("opportunity_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("offers").select("id, party, kind, amount, currency, conditions, response_deadline, status, created_at").eq("opportunity_id", id).order("created_at", { ascending: false }),
    supabase.from("checklist_items").select("id, label, position, done, done_at").eq("opportunity_id", id).order("position"),
  ]);
  return {
    events: (events.data ?? []) as Record<string, unknown>[],
    offers: (offers.data ?? []) as Record<string, unknown>[],
    checklist: (checklist.data ?? []) as Record<string, unknown>[],
  };
}

export async function oppFormOptions(supabase: SupabaseClient) {
  const [clients, yachts] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("yachts").select("id, name").order("name"),
  ]);
  return {
    clients: (clients.data ?? []) as { id: string; name: string }[],
    yachts: (yachts.data ?? []) as { id: string; name: string }[],
  };
}
