import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { toCsv, type CsvColumn } from "@/lib/csv";

/* eslint-disable @typescript-eslint/no-explicit-any */

// entity → { table, select, columns }. Org isolation is enforced by RLS.
const SPEC: Record<string, { select: string; from: string; order: string; columns: CsvColumn[] }> = {
  fleet: {
    from: "yachts",
    select: "name, type, builder, year, loa_m, price, currency, lob, status, region, hull_id, imo, broker:profiles!primary_broker(full_name), owner:owners(name)",
    order: "name",
    columns: [
      { label: "Name", get: (r) => r.name }, { label: "Type", get: (r) => r.type }, { label: "Builder", get: (r) => r.builder },
      { label: "Year", get: (r) => r.year }, { label: "LOA (m)", get: (r) => r.loa_m }, { label: "Price", get: (r) => r.price },
      { label: "Currency", get: (r) => r.currency }, { label: "LOB", get: (r) => r.lob }, { label: "Status", get: (r) => r.status },
      { label: "Region", get: (r) => r.region }, { label: "Hull ID", get: (r) => r.hull_id }, { label: "IMO", get: (r) => r.imo },
      { label: "Broker", get: (r) => r.broker?.full_name }, { label: "Owner", get: (r) => r.owner?.name },
    ],
  },
  leads: {
    from: "leads",
    select: "name, email, phone, lob, status, temperature, source, ai_confidence, broker:profiles!assigned_broker(full_name)",
    order: "created_at.desc",
    columns: [
      { label: "Name", get: (r) => r.name }, { label: "Email", get: (r) => r.email }, { label: "Phone", get: (r) => r.phone },
      { label: "LOB", get: (r) => r.lob }, { label: "Status", get: (r) => r.status }, { label: "Temperature", get: (r) => r.temperature },
      { label: "Source", get: (r) => r.source }, { label: "AI score", get: (r) => r.ai_confidence }, { label: "Broker", get: (r) => r.broker?.full_name },
    ],
  },
  clients: {
    from: "clients",
    select: "name, email, phone, categories, temperature, source, last_interaction_at, broker:profiles!assigned_broker(full_name), company:companies(name)",
    order: "created_at.desc",
    columns: [
      { label: "Name", get: (r) => r.name }, { label: "Email", get: (r) => r.email }, { label: "Phone", get: (r) => r.phone },
      { label: "Categories", get: (r) => (r.categories ?? []).join("; ") }, { label: "Temperature", get: (r) => r.temperature },
      { label: "Source", get: (r) => r.source }, { label: "Company", get: (r) => r.company?.name }, { label: "Broker", get: (r) => r.broker?.full_name },
      { label: "Last activity", get: (r) => r.last_interaction_at },
    ],
  },
  owners: {
    from: "owners",
    select: "name, email, phone, notes",
    order: "name",
    columns: [
      { label: "Name", get: (r) => r.name }, { label: "Email", get: (r) => r.email }, { label: "Phone", get: (r) => r.phone }, { label: "Notes", get: (r) => r.notes },
    ],
  },
};

export async function GET(_req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const spec = SPEC[entity];
  if (!spec) return new Response("Unknown export", { status: 404 });
  const profile = await getProfile();
  if (!profile?.org_id) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const [col, dir] = spec.order.split(".");
  const { data } = await (supabase.from(spec.from as any) as any).select(spec.select).order(col, { ascending: dir !== "desc" });
  const csv = toCsv((data ?? []) as any[], spec.columns);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vessilon-${entity}-${date}.csv"`,
    },
  });
}
