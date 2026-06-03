import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listClosings, closingStats } from "@/lib/queries/closings";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ClosingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const [rows, stats] = await Promise.all([listClosings(supabase), closingStats(supabase)]);

  return (
    <AppShell active="closings" user={shellUser(profile)}>
      <PageHeader title="Closings" crumb="brokerage / closings" />

      <div className="kpi-row">
        <div className="kpi"><div className="l">In closing</div><div className="v tnum">{stats.active}</div><div className="sub2">active transactions</div></div>
        <div className="kpi"><div className="l">Completed</div><div className="v tnum">{stats.completed}</div><div className="sub2">won deals</div></div>
        <div className="kpi"><div className="l">Value in closing</div><div className="v tnum">{money(stats.value)}</div><div className="sub2">gross transaction value</div></div>
        <div className="kpi"><div className="l">Pieces tracked</div><div className="v tnum">{rows.reduce((s, r) => s + r.milestones.total, 0)}</div><div className="sub2">closing milestones</div></div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No closings" message="Deals in a conditional/closing stage or marked won appear here." />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Deal</th><th>Vessel</th><th className="num">Closing date</th><th className="num">Progress</th><th>Escrow</th><th className="num">Value</th><th>Status</th><th className="chev" /></tr></thead>
            <tbody>
              {rows.map((o: any) => (
                <tr key={o.id}>
                  <td><Link href={`/closings/${o.id}`} className="vc-cell row-link stretch"><span className="nm">{o.title}<small>{o.stage?.name ?? ""}</small></span></Link></td>
                  <td>{o.yacht?.name ?? o.client?.name ?? "—"}</td>
                  <td className="tnum">{o.closing_date ? new Date(o.closing_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : (o.expected_close ? new Date(o.expected_close).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—")}</td>
                  <td className="tnum">{o.milestones.total ? `${o.milestones.done}/${o.milestones.total}` : "—"}</td>
                  <td>{o.escrow_status ? <Pill tone={o.escrow_status === "released" ? "ok" : "warn"}>{label(o.escrow_status)}</Pill> : "—"}</td>
                  <td className="tnum">{o.value ? money(o.value) : "—"}</td>
                  <td><Pill tone={toneFor(o.status)}>{label(o.status)}</Pill></td>
                  <td className="chev">›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
