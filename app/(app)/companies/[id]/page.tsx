import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getCompany, getCompanyRelations } from "@/lib/queries/companies";
import { deleteCompany } from "@/lib/actions/companies";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ConfirmForm from "@/components/app/ConfirmForm";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const c = (await getCompany(supabase, id)) as any;
  if (!c) notFound();
  const rel = await getCompanyRelations(supabase, id);
  const extHref = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);

  return (
    <AppShell active="companies" user={shellUser(profile)}>
      <Link href="/companies" className="back">← Companies</Link>
      <PageHeader
        title={c.name}
        crumb="dataroom / companies"
        sub={<><Pill tone="info">{label(c.type)}</Pill>{c.country && <span>{c.country}</span>}{c.website && <a href={extHref(c.website)} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{c.website} ↗</a>}</>}
        actions={<><Link href={`/companies/${id}/edit`} className="btn outline sm">Edit</Link><ConfirmForm action={deleteCompany.bind(null, id)} message={`Delete company "${c.name}"? This can't be undone.`}><button className="btn outline sm" type="submit">Delete</button></ConfirmForm></>}
      />
      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Clients</h4><span className="sub">{rel.clients.length}</span></div>
            {rel.clients.length ? (
              <div className="linked-records">
                {rel.clients.map((cl: any) => (
                  <Link href={`/clients/${cl.id}`} className="lr row-link" key={cl.id}><span className="ic">CL</span><span className="nm">{cl.name}<small>{(cl.categories ?? []).map(label).join(", ")}</small></span>{cl.temperature && <span className="end"><Pill tone={toneFor(cl.temperature)}>{label(cl.temperature)}</Pill></span>}</Link>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No client contacts linked.</p>}
          </div>
          <div className="panel">
            <div className="panel-h"><h4>Owners</h4><span className="sub">{rel.owners.length}</span></div>
            {rel.owners.length ? (
              <div className="linked-records">
                {rel.owners.map((o: any) => (
                  <Link href={`/owners/${o.id}`} className="lr row-link" key={o.id}><span className="ic">OW</span><span className="nm">{o.name}<small>{o.email ?? ""}</small></span></Link>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No owner entities linked.</p>}
          </div>
        </div>
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Company</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Type</span><span className="v">{label(c.type)}</span></div>
              <div className="sr"><span className="k">Country</span><span className="v">{c.country ?? "—"}</span></div>
              <div className="sr"><span className="k">VAT / Tax ID</span><span className="v">{c.vat_id ?? "—"}</span></div>
              <div className="sr"><span className="k">Website</span><span className="v">{c.website ? <a href={extHref(c.website)} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{c.website}</a> : "—"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
