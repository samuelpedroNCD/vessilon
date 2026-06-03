import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listClients, clientStats, type ClientFilters } from "@/lib/queries/clients";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { Pill, toneFor, label } from "@/components/app/Pill";

const TEMP = ["hot", "warm", "cold"];
const CAT = ["buyer", "seller", "charter_guest", "co_owner", "owner"];

function ago(iso: string | null) {
  if (!iso) return "—";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? "today" : `${days}d ago`;
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const filters: ClientFilters = { q: sp.q, temperature: sp.temperature, category: sp.category };
  const supabase = await createClient();
  const [clients, stats] = await Promise.all([listClients(supabase, filters), clientStats(supabase)]);

  return (
    <AppShell active="buyers" user={shellUser(profile)}>
      <PageHeader title="Clients" crumb="brokerage / clients" actions={<Link href="/clients/new" className="btn primary">+ Add client</Link>} />
      <div className="kpi-row">
        <div className="kpi"><div className="l">Total clients</div><div className="v tnum">{stats.total}</div></div>
        <div className="kpi"><div className="l">Hot</div><div className="v tnum alert">{stats.hot}</div></div>
        <div className="kpi"><div className="l">Buyers</div><div className="v tnum">{stats.buyers}</div></div>
        <div className="kpi"><div className="l">Sellers</div><div className="v tnum">{stats.sellers}</div></div>
      </div>
      <Toolbar
        current={filters as Record<string, string | undefined>}
        searchPlaceholder="Search name or email…"
        filters={[
          { name: "temperature", label: "All temps", options: TEMP.map((s) => ({ value: s, label: label(s) })) },
          { name: "category", label: "All categories", options: CAT.map((s) => ({ value: s, label: label(s) })) },
        ]}
      />
      {clients.length === 0 ? (
        <EmptyState title="No clients match" message="Adjust filters, or add a client." ctaLabel="+ Add client" ctaHref="/clients/new" />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Client</th><th>Company</th><th>Categories</th><th>Temp</th><th>Last activity</th><th>Broker</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/clients/${c.id}`} className="vc-cell row-link stretch"><span className="nm">{c.name}<small>{c.email ?? c.phone ?? ""}</small></span></Link></td>
                  <td>{c.company?.name ?? "—"}</td>
                  <td>{c.categories?.length ? c.categories.map(label).join(", ") : "—"}</td>
                  <td>{c.temperature ? <Pill tone={toneFor(c.temperature)}>{label(c.temperature)}</Pill> : "—"}</td>
                  <td className="tnum">{ago(c.last_interaction_at)}</td>
                  <td>{c.broker?.full_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
