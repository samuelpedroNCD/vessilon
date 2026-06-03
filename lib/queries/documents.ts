import type { SupabaseClient } from "@supabase/supabase-js";

export type EntityKind = "yacht" | "client" | "owner" | "opportunity";

const COLUMN: Record<EntityKind, string> = {
  yacht: "yacht_id",
  client: "client_id",
  owner: "owner_id",
  opportunity: "opportunity_id",
};

export type DocumentRow = {
  id: string;
  name: string;
  type: string;
  version: number;
  storage_path: string | null;
  created_at: string;
  uploaded_by: string | null;
};

/** Documents linked to a single entity, newest first. */
export async function listDocuments(
  supabase: SupabaseClient,
  entity: EntityKind,
  id: string,
): Promise<DocumentRow[]> {
  const { data } = await supabase
    .from("documents")
    .select("id, name, type, version, storage_path, created_at, uploader:profiles!documents_created_by_fkey(full_name)")
    .eq(COLUMN[entity], id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((d) => ({
    id: d.id as string,
    name: d.name as string,
    type: d.type as string,
    version: d.version as number,
    storage_path: (d.storage_path as string | null) ?? null,
    created_at: d.created_at as string,
    uploaded_by: ((d.uploader as { full_name?: string } | null)?.full_name) ?? null,
  }));
}

export const DOCUMENT_TYPES = [
  "yacht_spec",
  "survey",
  "sea_trial",
  "purchase_agreement",
  "charter_contract",
  "invoice",
  "loi",
  "nda",
  "insurance",
  "owner_mandate",
  "marketing",
  "other",
] as const;
