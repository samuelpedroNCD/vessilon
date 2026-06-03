import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function listInvitations(supabase: SupabaseClient): Promise<any[]> {
  const { data } = await supabase
    .from("invitations")
    .select("id, email, role, token, status, created_at, accepted_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as any[];
}
