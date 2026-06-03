import type { SupabaseClient } from "@supabase/supabase-js";

export async function listTasks(supabase: SupabaseClient, f: { status?: string; priority?: string }) {
  let query = supabase
    .from("tasks")
    .select("id, title, description, due_at, status, priority, assignee:profiles!assignee(full_name), client:clients(id, name), lead:leads(id, name), yacht:yachts(id, name)")
    .order("due_at", { ascending: true, nullsFirst: false });
  if (f.status) query = query.eq("status", f.status);
  if (f.priority) query = query.eq("priority", f.priority);
  const { data } = await query;
  return (data ?? []) as Record<string, unknown>[];
}
