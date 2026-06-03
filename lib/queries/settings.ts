import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrg(supabase: SupabaseClient) {
  // RLS scopes organisations to the caller's own org → exactly one row.
  const { data } = await supabase.from("organisations").select("*").limit(1).single();
  return data as Record<string, unknown> | null;
}

export async function listUsers(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, title, office_id")
    .order("created_at");
  return (data ?? []) as Record<string, unknown>[];
}
