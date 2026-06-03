import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listOwners } from "@/lib/queries/owners";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";

export default async function OwnersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const owners = await listOwners(supabase, { q: sp.q });

  return (
    <AppShell active="owners" user={shellUser(profile)}>
      <PageHeader title="Owners" crumb="management / owners" actions={<Link href="/owners/new" className="btn primary">+ Add owner</Link>} />
      <Toolbar current={{ q: sp.q }} searchPlaceholder="Search owners…" />
      {owners.length === 0 ? (
        <EmptyState title="No owners yet" message="Add owner profiles for your listed yachts." ctaLabel="+ Add owner" ctaHref="/owners/new" />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Owner</th><th>Email</th><th>Phone</th><th className="num">Yachts</th><th className="chev" /></tr></thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/owners/${o.id}`} className="vc-cell row-link stretch"><span className="nm">{o.name}</span></Link></td>
                  <td>{o.email ?? "—"}</td>
                  <td>{o.phone ?? "—"}</td>
                  <td className="tnum">{o.yachts?.[0]?.count ?? 0}</td>
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
