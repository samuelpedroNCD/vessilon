import type { SupabaseClient } from "@supabase/supabase-js";
import { commissionRate } from "@/lib/commission";

export type BrokerRow = {
  id: string;
  name: string;
  openCount: number;
  openWeighted: number;
  wonCount: number;
  wonValue: number;
};
export type LobRow = { lob: string; count: number; value: number; weighted: number };
export type FleetRow = { status: string; count: number };
export type WonRow = { title: string; value: number; broker: string; when: string };

export type Executive = {
  hasData: boolean;
  kpis: {
    openValue: number;
    weighted: number;
    openCount: number;
    wonQtdValue: number;
    wonQtdCount: number;
    decidedQtd: number;
    winRate: number; // 0..1 over the quarter
    commissionEst: number;
    inventoryValue: number;
    fleetActive: number;
  };
  brokers: BrokerRow[];
  lobs: LobRow[];
  fleet: FleetRow[];
  recentWon: WonRow[];
};

type Opp = {
  value: number | null;
  probability: number | null;
  status: string;
  lob: string;
  won_at: string | null;
  stage_entered_at: string | null;
  assigned_broker: string | null;
  title: string;
  stage: { probability: number | null } | null;
};

function quarterStartISO(): string {
  const now = new Date();
  const q = Math.floor(now.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(now.getUTCFullYear(), q, 1)).toISOString();
}

export async function getExecutive(supabase: SupabaseClient, orgId: string): Promise<Executive> {
  const qStart = quarterStartISO();

  const [{ data: oppData }, { data: profData }, { data: yachtData }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("value, probability, status, lob, won_at, stage_entered_at, assigned_broker, title, stage:lob_stages(probability)")
      .eq("org_id", orgId),
    supabase.from("profiles").select("id, full_name").eq("org_id", orgId),
    supabase.from("yachts").select("status, price").eq("org_id", orgId),
  ]);

  const opps = (oppData ?? []) as unknown as Opp[];
  const names = new Map<string, string>(
    ((profData ?? []) as { id: string; full_name: string | null }[]).map((p) => [p.id, p.full_name ?? "—"]),
  );

  const open = opps.filter((o) => o.status === "open");
  const won = opps.filter((o) => o.status === "won");
  const lost = opps.filter((o) => o.status === "lost");
  const wq = (o: Opp) => (o.value ?? 0) * ((o.probability ?? o.stage?.probability ?? 0) / 100);

  const openValue = open.reduce((s, o) => s + (o.value ?? 0), 0);
  const weighted = open.reduce((s, o) => s + wq(o), 0);

  const wonQtd = won.filter((o) => o.won_at && o.won_at >= qStart);
  // Lost deals carry no won_at; approximate "lost this quarter" by when they
  // entered their (lost) stage, mirroring the won-this-quarter window.
  const lostQtd = lost.filter((o) => o.stage_entered_at && o.stage_entered_at >= qStart);
  const wonQtdValue = wonQtd.reduce((s, o) => s + (o.value ?? 0), 0);
  const decided = wonQtd.length + lostQtd.length;
  const winRate = decided ? wonQtd.length / decided : 0;
  const commissionEst = won.reduce((s, o) => s + (o.value ?? 0) * commissionRate(o.lob), 0);

  // Broker leaderboard
  const bmap = new Map<string, BrokerRow>();
  const ensure = (id: string | null): BrokerRow => {
    const key = id ?? "unassigned";
    let row = bmap.get(key);
    if (!row) {
      row = { id: key, name: id ? names.get(id) ?? "—" : "Unassigned", openCount: 0, openWeighted: 0, wonCount: 0, wonValue: 0 };
      bmap.set(key, row);
    }
    return row;
  };
  for (const o of open) {
    const r = ensure(o.assigned_broker);
    r.openCount += 1;
    r.openWeighted += wq(o);
  }
  for (const o of won) {
    const r = ensure(o.assigned_broker);
    r.wonCount += 1;
    r.wonValue += o.value ?? 0;
  }
  const brokers = [...bmap.values()].sort((a, b) => b.wonValue - a.wonValue || b.openWeighted - a.openWeighted);

  // Pipeline by LOB
  const lmap = new Map<string, LobRow>();
  for (const o of open) {
    const r = lmap.get(o.lob) ?? { lob: o.lob, count: 0, value: 0, weighted: 0 };
    r.count += 1;
    r.value += o.value ?? 0;
    r.weighted += wq(o);
    lmap.set(o.lob, r);
  }
  const lobs = [...lmap.values()].sort((a, b) => b.value - a.value);

  // Fleet mix + inventory value
  const yachts = (yachtData ?? []) as { status: string; price: number | null }[];
  const fmap = new Map<string, number>();
  let inventoryValue = 0;
  let fleetActive = 0;
  for (const y of yachts) {
    fmap.set(y.status, (fmap.get(y.status) ?? 0) + 1);
    if (y.status === "active" || y.status === "under_offer" || y.status === "conditional") {
      inventoryValue += y.price ?? 0;
      fleetActive += 1;
    }
  }
  const fleet = [...fmap.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);

  // Recent wins
  const recentWon: WonRow[] = won
    .filter((o) => o.won_at)
    .sort((a, b) => (a.won_at! < b.won_at! ? 1 : -1))
    .slice(0, 6)
    .map((o) => ({
      title: o.title,
      value: o.value ?? 0,
      broker: o.assigned_broker ? names.get(o.assigned_broker) ?? "—" : "—",
      when: new Date(o.won_at!).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    }));

  return {
    hasData: opps.length > 0 || yachts.length > 0,
    kpis: { openValue, weighted, openCount: open.length, wonQtdValue, wonQtdCount: wonQtd.length, decidedQtd: decided, winRate, commissionEst, inventoryValue, fleetActive },
    brokers,
    lobs,
    fleet,
    recentWon,
  };
}
