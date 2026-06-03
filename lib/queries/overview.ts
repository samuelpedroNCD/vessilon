import type { SupabaseClient } from "@supabase/supabase-js";

// ---- formatting helpers ----
export function money(n: number): string {
  if (!n) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

export type StageRow = { name: string; position: number; count: number; value: number };
export type ClosingRow = { yacht: string; sub: string; date: string; stage: string; value: number; color: string };
export type ActivityRow = { who: string; body: string; ts: string; kind: "agent" | "ok" | "deal" };
export type TaskRow = { title: string; sub: string; due: string; done: boolean; urgent: boolean };

export type Overview = {
  hasData: boolean;
  kpis: {
    weightedPipeline: number;
    activeOffers: number;
    closings30d: number;
    closings30dValue: number;
    tasksDueToday: number;
  };
  stages: StageRow[];
  closings: ClosingRow[];
  activity: ActivityRow[];
  tasks: TaskRow[];
};

export const EMPTY_OVERVIEW: Overview = {
  hasData: false,
  kpis: { weightedPipeline: 0, activeOffers: 0, closings30d: 0, closings30dValue: 0, tasksDueToday: 0 },
  stages: [],
  closings: [],
  activity: [],
  tasks: [],
};

type OppRow = {
  value: number | null;
  probability: number | null;
  status: string;
  expected_close: string | null;
  won_at: string | null;
  stage: { name: string; position: number; probability: number; is_won: boolean } | null;
  yacht: { name: string; hull_id: string | null; loa_m: number | null; hero_color: string | null } | null;
};

const CLOSING_STAGES = new Set(["Conditional", "Completion", "Survey & Sea Trial"]);

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export async function getOverview(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
): Promise<Overview> {
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: oppsData }, { data: taskData }, { data: acts }] = await Promise.all([
    supabase
      .from("opportunities")
      .select(
        "value, probability, status, expected_close, won_at, stage:lob_stages(name, position, probability, is_won), yacht:yachts(name, hull_id, loa_m, hero_color)",
      )
      .eq("org_id", orgId),
    supabase
      .from("tasks")
      .select("title, description, due_at, status")
      .eq("assignee", userId)
      .gte("due_at", `${today}T00:00:00`)
      .lte("due_at", `${today}T23:59:59`)
      .order("due_at", { ascending: true }),
    supabase
      .from("interactions")
      .select("type, notes, occurred_at, yacht:yachts(name)")
      .order("occurred_at", { ascending: false })
      .limit(5),
  ]);

  const opps = (oppsData ?? []) as unknown as OppRow[];
  const open = opps.filter((o) => o.status === "open");
  const won = opps.filter((o) => o.status === "won");

  // KPIs
  const weightedPipeline = open.reduce((s, o) => {
    const prob = o.probability ?? o.stage?.probability ?? 0;
    return s + (o.value ?? 0) * (prob / 100);
  }, 0);
  const activeOffers = open.filter((o) => /offer/i.test(o.stage?.name ?? "")).length;
  const won30 = won.filter((o) => o.won_at && o.won_at >= since30);
  const closings30d = won30.length;
  const closings30dValue = won30.reduce((s, o) => s + (o.value ?? 0), 0);

  // Pipeline by stage (open) + a Closed bucket from won-30d
  const byStage = new Map<string, StageRow>();
  for (const o of open) {
    const st = o.stage;
    if (!st) continue;
    const cur = byStage.get(st.name) ?? { name: st.name, position: st.position, count: 0, value: 0 };
    cur.count += 1;
    cur.value += o.value ?? 0;
    byStage.set(st.name, cur);
  }
  const stages = [...byStage.values()].sort((a, b) => a.position - b.position);
  if (closings30d > 0) {
    stages.push({ name: "Closed 30d", position: 999, count: closings30d, value: closings30dValue });
  }

  // Closing this week
  const closings: ClosingRow[] = open
    .filter(
      (o) =>
        o.expected_close &&
        o.expected_close >= today &&
        o.expected_close <= weekEnd &&
        CLOSING_STAGES.has(o.stage?.name ?? ""),
    )
    .sort((a, b) => (a.expected_close! < b.expected_close! ? -1 : 1))
    .slice(0, 5)
    .map((o) => ({
      yacht: o.yacht?.name ?? "—",
      sub: `${o.yacht?.hull_id ?? ""}${o.yacht?.loa_m ? ` · ${o.yacht.loa_m}m` : ""}`,
      date: o.expected_close
        ? new Date(o.expected_close).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })
        : "—",
      stage: o.stage?.name ?? "",
      value: o.value ?? 0,
      color: o.yacht?.hero_color ?? "",
    }));

  // Recent activity (interactions)
  const activity: ActivityRow[] = ((acts ?? []) as unknown as {
    type: string;
    notes: string | null;
    occurred_at: string;
    yacht: { name: string } | null;
  }[]).map((a) => ({
    who: a.yacht?.name ?? "Activity",
    body: a.notes ?? a.type,
    ts: relTime(a.occurred_at),
    kind: "deal" as const,
  }));

  // Today's tasks (rail)
  const taskRows = (taskData ?? []) as unknown as {
    title: string;
    description: string | null;
    due_at: string | null;
    status: string;
  }[];
  const tasks: TaskRow[] = taskRows.map((t) => ({
    title: t.title,
    sub: t.description ?? "",
    due: t.due_at
      ? new Date(t.due_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "EOD",
    done: t.status === "completed",
    urgent: t.status !== "completed" && !!t.due_at && new Date(t.due_at).getTime() < Date.now(),
  }));
  const tasksDueToday = taskRows.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;

  return {
    hasData: opps.length > 0,
    kpis: {
      weightedPipeline,
      activeOffers,
      closings30d,
      closings30dValue,
      tasksDueToday,
    },
    stages,
    closings,
    activity,
    tasks,
  };
}
