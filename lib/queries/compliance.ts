import type { SupabaseClient } from "@supabase/supabase-js";
import { certStatus } from "@/lib/certs";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function listVesselCerts(supabase: SupabaseClient, f: { yacht_id?: string; type?: string } = {}): Promise<any[]> {
  let query = supabase
    .from("vessel_certificates")
    .select("id, type, name, issuer, reference, issued_on, expires_on, yacht:yachts(id, name)")
    .order("expires_on", { nullsFirst: false });
  if (f.yacht_id) query = query.eq("yacht_id", f.yacht_id);
  if (f.type) query = query.eq("type", f.type);
  const { data } = await query;
  return (data ?? []) as any[];
}

export async function complianceStats(supabase: SupabaseClient) {
  const { data } = await supabase.from("vessel_certificates").select("expires_on, yacht_id");
  const rows = (data ?? []) as { expires_on: string | null; yacht_id: string }[];
  let expired = 0, soon = 0, ok = 0;
  for (const r of rows) {
    const b = certStatus(r.expires_on).bucket;
    if (b === "expired") expired++;
    else if (b === "soon") soon++;
    else ok++;
  }
  return { total: rows.length, expired, soon, ok, vessels: new Set(rows.map((r) => r.yacht_id)).size };
}

export const CERT_TYPES = ["flag", "ism", "mlc", "insurance", "class", "registry", "radio", "survey", "other"] as const;
