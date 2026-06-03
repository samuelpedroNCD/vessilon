import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listCompanies, companyStats, type CompanyFilters } from "@/lib/queries/companies";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { label } from "@/components/app/Pill";

const TYPES = ["owner", "client", "partner", "broker", "other"];

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const filters: CompanyFilters = { q: sp.q, type: sp.type };
  const supabase = await createClient();
  const [companies, stats] = await Promise.all([listCompanies(supabase, filters), companyStats(supabase)]);

  return (
    <AppShell active="companies" user={shellUser(profile)}>
      <PageHeader title="Companies" crumb="dataroom / companies" actions={<Link href="/companies/new" className="btn primary">+ Add company</Link>} />
      <div className="kpi-row">
        <div className="kpi"><div className="l">Total</div><div className="v tnum">{stats.total}</div><div className="sub2">corporate entities</div></div>
        <div className="kpi"><div className="l">Client cos</div><div className="v tnum">{stats.clients}</div><div className="sub2">buy/charter side</div></div>
        <div className="kpi"><div className="l">Owner cos</div><div className="v tnum">{stats.owners}</div><div className="sub2">holding entities</div></div>
        <div className="kpi"><div className="l">Partners</div><div className="v tnum">{stats.partners}</div><div className="sub2">co-brokerage etc.</div></div>
      </div>
      <Toolbar current={filters as Record<string, string | undefined>} searchPlaceholder="Search companies…" filters={[{ name: "type", label: "All types", options: TYPES.map((t) => ({ value: t, label: label(t) })) }]} />
      {companies.length === 0 ? (
        <EmptyState title="No companies yet" message="Add the corporate entities behind your owners, clients and partners." ctaLabel="+ Add company" ctaHref="/companies/new" />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Company</th><th>Type</th><th>Country</th><th className="num">Clients</th><th className="num">Owners</th><th className="chev" /></tr></thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/companies/${c.id}`} className="vc-cell row-link stretch"><span className="nm">{c.name}<small>{c.website ?? ""}</small></span></Link></td>
                  <td>{label(c.type)}</td>
                  <td>{c.country ?? "—"}</td>
                  <td className="tnum">{c.clients?.[0]?.count ?? 0}</td>
                  <td className="tnum">{c.owners?.[0]?.count ?? 0}</td>
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
