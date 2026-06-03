import type { SupabaseClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CLOSING_RE = /conditional|completion|closing|survey|signing|escrow|legal/i;

/** A deal counts as "in closing" if won, in a won stage, or in a closing-ish stage. */
function isClosing(o: { status: string; stage: { name?: string; is_won?: boolean } | null }): boolean {
  return o.status === "won" || !!o.stage?.is_won || CLOSING_RE.test(o.stage?.name ?? "");
}

export async function listClosings(supabase: SupabaseClient): Promise<Record<string, any>[]> {
  const [{ data: opps }, { data: checks }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, title, value, status, closing_date, escrow_status, expected_close, lob, stage:lob_stages(name, is_won, is_lost), yacht:yachts(name), client:clients(name)")
      .order("closing_date", { ascending: true, nullsFirst: false }),
    supabase.from("closing_milestones").select("opportunity_id, done"),
  ]);

  const milestones = (checks ?? []) as { opportunity_id: string; done: boolean }[];
  const prog = new Map<string, { done: number; total: number }>();
  for (const m of milestones) {
    const p = prog.get(m.opportunity_id) ?? { done: 0, total: 0 };
    p.total += 1;
    if (m.done) p.done += 1;
    prog.set(m.opportunity_id, p);
  }

  return ((opps ?? []) as unknown as Array<Record<string, any>>)
    .filter((o) => isClosing(o as any))
    .map((o) => ({ ...o, milestones: prog.get(o.id as string) ?? { done: 0, total: 0 } }));
}

export async function closingStats(supabase: SupabaseClient) {
  const list = await listClosings(supabase);
  return {
    active: list.filter((o) => o.status !== "won").length,
    completed: list.filter((o) => o.status === "won").length,
    value: list.reduce((s, o) => s + (Number(o.value) || 0), 0),
  };
}

export async function getClosing(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("opportunities")
    .select("*, stage:lob_stages(name, is_won), yacht:yachts(id, name), client:clients(id, name), broker:profiles!assigned_broker(full_name)")
    .eq("id", id)
    .single();
  return data as Record<string, unknown> | null;
}

export async function getClosingExtras(supabase: SupabaseClient, id: string) {
  const [milestones, parties, splits] = await Promise.all([
    supabase.from("closing_milestones").select("*").eq("opportunity_id", id).order("position"),
    supabase.from("closing_parties").select("*").eq("opportunity_id", id).order("created_at"),
    supabase.from("commission_splits").select("*, broker:profiles!broker_id(full_name)").eq("opportunity_id", id).order("created_at"),
  ]);
  return {
    milestones: (milestones.data ?? []) as Record<string, any>[],
    parties: (parties.data ?? []) as Record<string, any>[],
    splits: (splits.data ?? []) as Record<string, any>[],
  };
}

export const PARTY_ROLES = ["buyer", "seller", "buyer_lawyer", "seller_lawyer", "broker", "escrow_agent", "surveyor", "other"] as const;
export const ESCROW_STATUSES = ["none", "pending", "deposit_held", "balance_held", "released"] as const;
