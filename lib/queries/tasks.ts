import type { SupabaseClient } from "@supabase/supabase-js";

export async function taskStats(supabase: SupabaseClient) {
  const { data } = await supabase.from("tasks").select("status, due_at");
  const rows = (data ?? []) as { status: string; due_at: string | null }[];
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const open = rows.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  return {
    open: open.length,
    overdue: open.filter((r) => r.due_at && new Date(r.due_at).getTime() < now).length,
    dueToday: open.filter((r) => r.due_at && r.due_at.slice(0, 10) === today).length,
    completed: rows.filter((r) => r.status === "completed").length,
  };
}

export async function listTasks(supabase: SupabaseClient, f: { status?: string; priority?: string }) {
  let query = supabase
    .from("tasks")
    .select("id, title, description, due_at, status, priority, assignee:profiles!assignee(full_name), client:clients(id, name), lead:leads(id, name), yacht:yachts(id, name), opportunity:opportunities(id, title)")
    .order("due_at", { ascending: true, nullsFirst: false });
  if (f.status) query = query.eq("status", f.status);
  if (f.priority) query = query.eq("priority", f.priority);
  const { data } = await query;
  return (data ?? []) as Record<string, unknown>[];
}
