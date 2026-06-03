import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listCrew, crewStats, CREW_STATUSES } from "@/lib/queries/crew";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { Pill, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CrewPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const [rows, stats] = await Promise.all([listCrew(supabase, { q: sp.q, status: sp.status }), crewStats(supabase)]);

  return (
    <AppShell active="crew" user={shellUser(profile)}>
      <PageHeader title="Crew" crumb="management / crew" actions={<Link href="/crew/new" className="btn primary">+ Add crew</Link>} />
      <div className="kpi-row">
        <div className="kpi"><div className="l">Crew</div><div className="v tnum">{stats.total}</div><div className="sub2">on the books</div></div>
        <div className="kpi"><div className="l">Onboard</div><div className="v tnum">{stats.onboard}</div><div className="sub2">currently aboard</div></div>
        <div className="kpi"><div className="l">Available</div><div className="v tnum">{stats.available}</div><div className="sub2">for placement</div></div>
        <div className="kpi"><div className="l">Certs expiring</div><div className="v tnum alert">{stats.expiring}</div><div className="sub2">expired or ≤90d</div></div>
      </div>
      <Toolbar
        current={{ q: sp.q, status: sp.status }}
        searchPlaceholder="Search name or position…"
        filters={[{ name: "status", label: "All statuses", options: CREW_STATUSES.map((s) => ({ value: s, label: label(s) })) }]}
      />
      {rows.length === 0 ? (
        <EmptyState title="No crew" message="Add crew to track positions, certificates and assignments." ctaLabel="+ Add crew" ctaHref="/crew/new" />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Position</th><th>Nationality</th><th>Current vessel</th><th className="num">Certs</th><th>Status</th><th className="chev" /></tr></thead>
            <tbody>
              {rows.map((c: any) => (
                <tr key={c.id}>
                  <td><Link href={`/crew/${c.id}`} className="vc-cell row-link stretch"><span className="nm">{c.name}</span></Link></td>
                  <td>{c.position ?? "—"}</td>
                  <td>{c.nationality ?? "—"}</td>
                  <td>{c.yacht?.name ?? "—"}</td>
                  <td className="tnum">{c.certCount}{c.expiring > 0 ? <Pill tone="danger">{c.expiring}!</Pill> : null}</td>
                  <td><Pill tone={c.status === "onboard" ? "ok" : c.status === "available" ? "info" : "gray"}>{label(c.status)}</Pill></td>
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
