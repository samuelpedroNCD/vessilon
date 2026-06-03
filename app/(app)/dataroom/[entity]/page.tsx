import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { REF } from "@/lib/dataroom/config";
import { listRef } from "@/lib/queries/reference";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function RefListPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { entity } = await params;
  const e = REF[entity];
  if (!e) notFound();
  const sp = await searchParams;
  const supabase = await createClient();
  const rows = (await listRef(supabase, e.table, sp.q)) as any[];
  const lc = e.singular.toLowerCase();

  return (
    <AppShell active={entity} user={shellUser(profile)}>
      <PageHeader title={e.label} crumb={`dataroom / ${e.slug}`} actions={<Link href={`/dataroom/${e.slug}/new`} className="btn primary">+ Add {lc}</Link>} />
      <Toolbar current={{ q: sp.q }} searchPlaceholder={`Search ${e.label.toLowerCase()}…`} />
      {rows.length === 0 ? (
        <EmptyState title={`No ${e.label.toLowerCase()} yet`} message={`Add a ${lc} to the directory.`} ctaLabel={`+ Add ${lc}`} ctaHref={`/dataroom/${e.slug}/new`} />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr>{e.columns.map((c) => <th key={c.key} className={c.num ? "num" : undefined}>{c.label}</th>)}<th className="chev" /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {e.columns.map((c, i) =>
                    i === 0 ? (
                      <td key={c.key}><Link href={`/dataroom/${e.slug}/${r.id}`} className="vc-cell row-link stretch"><span className="nm">{r[c.key] ?? "—"}</span></Link></td>
                    ) : (
                      <td key={c.key} className={c.num ? "tnum" : undefined}>{r[c.key] ?? "—"}</td>
                    ),
                  )}
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
