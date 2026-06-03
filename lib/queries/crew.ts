import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSearch } from "@/lib/queries/search";
import { certStatus } from "@/lib/certs";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function listCrew(supabase: SupabaseClient, f: { q?: string; status?: string } = {}): Promise<any[]> {
  let query = supabase
    .from("crew")
    .select("id, name, position, nationality, status, current_yacht_id, yacht:yachts!current_yacht_id(name), certs:crew_certificates(expires_on)")
    .order("name");
  if (f.status) query = query.eq("status", f.status);
  const term = sanitizeSearch(f.q);
  if (term) query = query.or(`name.ilike.%${term}%,position.ilike.%${term}%`);
  const { data } = await query;
  return ((data ?? []) as any[]).map((c) => {
    const expiring = (c.certs ?? []).filter((cert: any) => ["expired", "soon"].includes(certStatus(cert.expires_on).bucket)).length;
    return { ...c, certCount: (c.certs ?? []).length, expiring };
  });
}

export async function crewStats(supabase: SupabaseClient) {
  const rows = await listCrew(supabase);
  return {
    total: rows.length,
    onboard: rows.filter((r) => r.status === "onboard").length,
    available: rows.filter((r) => r.status === "available").length,
    expiring: rows.reduce((s, r) => s + r.expiring, 0),
  };
}

export async function getCrew(supabase: SupabaseClient, id: string) {
  const [{ data: c }, { data: certs }, { data: assignments }] = await Promise.all([
    supabase.from("crew").select("*, yacht:yachts!current_yacht_id(id, name)").eq("id", id).single(),
    supabase.from("crew_certificates").select("*").eq("crew_id", id).order("expires_on", { nullsFirst: false }),
    supabase.from("crew_assignments").select("*, yacht:yachts(id, name)").eq("crew_id", id).order("start_on", { ascending: false }),
  ]);
  return { crew: c as any, certs: (certs ?? []) as any[], assignments: (assignments ?? []) as any[] };
}

export const CREW_STATUSES = ["available", "onboard", "on_leave", "rotation", "inactive"] as const;
export const CREW_POSITIONS = ["Captain", "First Officer", "Chief Engineer", "Engineer", "Bosun", "Deckhand", "Chief Stew", "Stewardess", "Chef", "Purser", "Other"] as const;
