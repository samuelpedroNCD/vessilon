import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";

export type AuditFilters = { entity?: string; action?: string; q?: string; period?: string };

export type AuditEntry = {
  id: string;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  summary: string | null;
  created_at: string;
};

export async function listAudit(
  supabase: SupabaseClient,
  f: AuditFilters = {},
  limit = 200,
): Promise<AuditEntry[]> {
  let query = supabase
    .from("audit_log")
    .select("id, actor_name, action, entity_type, entity_id, entity_label, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (f.entity) query = query.eq("entity_type", f.entity);
  if (f.action) query = query.eq("action", f.action);
  const days = f.period ? Number(f.period) : 0;
  if (days > 0) query = query.gte("created_at", new Date(Date.now() - days * 86400000).toISOString());
  const term = sanitizeSearch(f.q);
  if (term) query = query.or(`entity_label.ilike.%${term}%,summary.ilike.%${term}%,actor_name.ilike.%${term}%`);
  const { data } = await query;
  return (data ?? []) as unknown as AuditEntry[];
}

/** Distinct entity types and actions present, for filter dropdowns. */
export async function auditFacets(supabase: SupabaseClient): Promise<{ entities: string[]; actions: string[] }> {
  const { data } = await supabase.from("audit_log").select("entity_type, action").limit(1000);
  const rows = (data ?? []) as { entity_type: string; action: string }[];
  return {
    entities: [...new Set(rows.map((r) => r.entity_type))].sort(),
    actions: [...new Set(rows.map((r) => r.action))].sort(),
  };
}
