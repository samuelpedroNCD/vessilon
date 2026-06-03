import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedItem = {
  id: string;
  kind: "interaction" | "audit";
  title: string;
  body: string;
  who: string | null;
  at: string;
};
export type InboxTask = {
  id: string;
  title: string;
  due_at: string | null;
  priority: string | null;
  overdue: boolean;
};
export type Inbox = {
  feed: FeedItem[];
  tasks: InboxTask[];
  unread: number;
  overdue: number;
};

export async function getInbox(supabase: SupabaseClient, orgId: string, userId: string): Promise<Inbox> {
  const [{ data: ix }, { data: tk }, { data: au }] = await Promise.all([
    supabase
      .from("interactions")
      .select("id, type, notes, occurred_at, yacht:yachts(name), client:clients(name)")
      .order("occurred_at", { ascending: false })
      .limit(15),
    supabase
      .from("tasks")
      .select("id, title, due_at, status, priority, assignee")
      .eq("org_id", orgId)
      .not("status", "in", "(completed,cancelled)")
      .order("due_at", { ascending: true })
      .limit(12),
    supabase
      .from("audit_log")
      .select("id, actor_name, action, entity_type, entity_label, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const interactions = (ix ?? []) as unknown as Array<{
    id: string; type: string; notes: string | null; occurred_at: string;
    yacht: { name: string } | null; client: { name: string } | null;
  }>;
  const audits = (au ?? []) as unknown as Array<{
    id: string; actor_name: string | null; action: string; entity_type: string;
    entity_label: string | null; summary: string | null; created_at: string;
  }>;

  const feed: FeedItem[] = [
    ...interactions.map((i) => ({
      id: `i-${i.id}`,
      kind: "interaction" as const,
      title: `${i.type.replace(/_/g, " ")}${i.client?.name ? ` · ${i.client.name}` : i.yacht?.name ? ` · ${i.yacht.name}` : ""}`,
      body: i.notes ?? "",
      who: i.client?.name ?? i.yacht?.name ?? null,
      at: i.occurred_at,
    })),
    ...audits.map((a) => ({
      id: `a-${a.id}`,
      kind: "audit" as const,
      title: `${a.action.replace(/_/g, " ")} · ${a.entity_label ?? a.entity_type}`,
      body: a.summary ?? "",
      who: a.actor_name,
      at: a.created_at,
    })),
  ]
    .sort((x, y) => (x.at < y.at ? 1 : -1))
    .slice(0, 20);

  const now = Date.now();
  const tasks: InboxTask[] = ((tk ?? []) as Array<{ id: string; title: string; due_at: string | null; priority: string | null }>)
    .map((t) => ({
      id: t.id,
      title: t.title,
      due_at: t.due_at,
      priority: t.priority,
      overdue: !!t.due_at && new Date(t.due_at).getTime() < now,
    }))
    // overdue first, then keep the due-date ascending order from the query
    .sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0));

  return {
    feed,
    tasks,
    unread: feed.length,
    overdue: tasks.filter((t) => t.overdue).length,
  };
}
