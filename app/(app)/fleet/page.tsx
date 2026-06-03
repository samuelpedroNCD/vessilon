import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listYachts, yachtStatusCounts, type YachtFilters } from "@/lib/queries/fleet";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { Pill, toneFor, label } from "@/components/app/Pill";

const STATUS = ["active", "under_offer", "conditional", "sold", "off_market", "draft"];
const LOB = ["sale", "charter", "new_build", "co_ownership", "trade", "services"];

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const filters: YachtFilters = { q: sp.q, status: sp.status, lob: sp.lob, type: sp.type };

  const supabase = await createClient();
  const [yachts, counts] = await Promise.all([listYachts(supabase, filters), yachtStatusCounts(supabase)]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <AppShell active="vessels" user={shellUser(profile)}>
      <PageHeader
        title="Fleet"
        crumb="management / fleet"
        actions={<Link href="/fleet/new" className="btn primary">+ Add yacht</Link>}
      />

      <div className="kpi-row">
        <div className="kpi"><div className="l">Total fleet</div><div className="v tnum">{total}</div></div>
        <div className="kpi"><div className="l">Active</div><div className="v tnum">{counts.active ?? 0}</div></div>
        <div className="kpi"><div className="l">Under offer</div><div className="v tnum">{(counts.under_offer ?? 0) + (counts.conditional ?? 0)}</div></div>
        <div className="kpi"><div className="l">Sold</div><div className="v tnum">{counts.sold ?? 0}</div></div>
      </div>

      <Toolbar
        current={filters as Record<string, string | undefined>}
        searchPlaceholder="Search name, hull, builder…"
        filters={[
          { name: "status", label: "All statuses", options: STATUS.map((s) => ({ value: s, label: label(s) })) },
          { name: "lob", label: "All LOBs", options: LOB.map((s) => ({ value: s, label: label(s) })) },
          { name: "type", label: "All types", options: [{ value: "motor", label: "Motor" }, { value: "sail", label: "Sail" }] },
        ]}
      />

      {yachts.length === 0 ? (
        <EmptyState
          title="No yachts match"
          message="Adjust your filters, or add a vessel to start building your fleet."
          ctaLabel="+ Add yacht"
          ctaHref="/fleet/new"
        />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Vessel</th><th>Type · LOB</th><th>LOA · Year</th><th>Price</th><th>Status</th><th>Broker</th><th>Region</th>
              </tr>
            </thead>
            <tbody>
              {yachts.map((y) => (
                <tr key={y.id}>
                  <td>
                    <Link href={`/fleet/${y.id}`} className="vc-cell row-link stretch">
                      <span className={`th vthumb ${y.hero_color ?? ""}`} />
                      <span className="nm">{y.name}<small>{y.hull_id ?? "—"}{y.builder ? ` · ${y.builder}` : ""}</small></span>
                    </Link>
                  </td>
                  <td>{label(y.type)} · {label(y.lob)}</td>
                  <td className="tnum">{y.loa_m ? `${y.loa_m}m` : "—"} · {y.year ?? "—"}</td>
                  <td className="tnum">{y.price ? money(y.price) : "—"}</td>
                  <td><Pill tone={toneFor(y.status)}>{label(y.status)}</Pill></td>
                  <td>{y.broker?.full_name ?? "—"}</td>
                  <td>{y.region ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
