import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listLeads, leadStats, type LeadFilters } from "@/lib/queries/leads";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { Pill, toneFor, label } from "@/components/app/Pill";

const STATUS = ["new", "contacted", "qualified", "converted", "unqualified", "lost"];
const LOB = ["sale", "charter", "new_build", "co_ownership", "trade", "services"];
const TEMP = ["hot", "warm", "cold"];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const filters: LeadFilters = { q: sp.q, status: sp.status, lob: sp.lob, temperature: sp.temperature };
  const supabase = await createClient();
  const [leads, stats] = await Promise.all([listLeads(supabase, filters), leadStats(supabase)]);

  return (
    <AppShell active="leads" user={shellUser(profile)}>
      <PageHeader title="Leads" crumb="brokerage / leads" actions={<Link href="/leads/new" className="btn primary">+ Add lead</Link>} />
      <div className="kpi-row">
        <div className="kpi"><div className="l">Total leads</div><div className="v tnum">{stats.total}</div></div>
        <div className="kpi"><div className="l">Open</div><div className="v tnum">{stats.open}</div></div>
        <div className="kpi"><div className="l">Hot</div><div className="v tnum alert">{stats.hot}</div></div>
        <div className="kpi"><div className="l">Converted</div><div className="v tnum">{stats.converted}</div></div>
      </div>
      <Toolbar
        current={filters as Record<string, string | undefined>}
        searchPlaceholder="Search name or email…"
        filters={[
          { name: "status", label: "All statuses", options: STATUS.map((s) => ({ value: s, label: label(s) })) },
          { name: "lob", label: "All LOBs", options: LOB.map((s) => ({ value: s, label: label(s) })) },
          { name: "temperature", label: "All temps", options: TEMP.map((s) => ({ value: s, label: label(s) })) },
        ]}
      />
      {leads.length === 0 ? (
        <EmptyState title="No leads match" message="Adjust filters, or add a lead to start your funnel." ctaLabel="+ Add lead" ctaHref="/leads/new" />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Lead</th><th>LOB</th><th>Status</th><th>Temp</th><th>Source</th><th>AI</th><th>Broker</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td><Link href={`/leads/${l.id}`} className="vc-cell row-link stretch"><span className="nm">{l.name ?? "—"}<small>{l.email ?? l.phone ?? ""}</small></span></Link></td>
                  <td>{label(l.lob)}</td>
                  <td><Pill tone={toneFor(l.status)}>{label(l.status)}</Pill></td>
                  <td>{l.temperature ? <Pill tone={toneFor(l.temperature)}>{label(l.temperature)}</Pill> : "—"}</td>
                  <td>{l.source ?? "—"}</td>
                  <td className="tnum">{l.ai_confidence != null ? `${Math.round(l.ai_confidence * 100)}%` : "—"}</td>
                  <td>{l.broker?.full_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
