import { money } from "@/lib/queries/overview";

/** Display config for owner-report metric keys. */
export const METRIC_DEFS: { key: string; label: string; money?: boolean }[] = [
  { key: "vessels", label: "Vessels managed" },
  { key: "listings", label: "Published listings" },
  { key: "enquiries", label: "Enquiries logged" },
  { key: "openDeals", label: "Open opportunities" },
  { key: "weightedPipeline", label: "Weighted pipeline", money: true },
  { key: "charters", label: "Charters" },
  { key: "avgDaysOnMarket", label: "Avg days on market" },
];

export function metricValue(def: { key: string; money?: boolean }, metrics: Record<string, number>): string {
  const v = Number(metrics?.[def.key] ?? 0);
  return def.money ? money(v) : String(v);
}
