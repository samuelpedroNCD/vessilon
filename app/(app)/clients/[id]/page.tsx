import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getClient, getClientRelations } from "@/lib/queries/clients";
import { deleteClientRecord } from "@/lib/actions/clients";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import LogInteractionForm from "@/components/app/LogInteractionForm";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const c = (await getClient(supabase, id)) as any;
  if (!c) notFound();
  const rel = await getClientRelations(supabase, id);

  return (
    <AppShell active="buyers" user={shellUser(profile)}>
      <Link href="/clients" className="back">← Clients</Link>
      <PageHeader
        title={c.name}
        crumb="brokerage / clients"
        sub={<>{c.temperature && <Pill tone={toneFor(c.temperature)}>{label(c.temperature)}</Pill>}{(c.categories ?? []).map((cat: string) => <span key={cat}>{label(cat)}</span>)}</>}
        actions={
          <>
            <Link href={`/clients/${id}/edit`} className="btn outline sm">Edit</Link>
            <form action={deleteClientRecord.bind(null, id)}><button className="btn outline sm" type="submit">Delete</button></form>
          </>
        }
      />

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Opportunities</h4><span className="sub">{rel.opps.length}</span></div>
            {rel.opps.length ? (
              <div className="linked-records">
                {rel.opps.map((o: any) => (
                  <div className="lr" key={o.id}><span className="ic">OP</span><span className="nm">{o.title}<small>{o.stage?.name ?? ""}{o.yacht?.name ? ` · ${o.yacht.name}` : ""}</small></span><span className="end">{o.value ? money(o.value) : "—"}</span></div>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No opportunities yet.</p>}
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Interactions</h4><span className="sub">{rel.interactions.length}</span></div>
            {rel.interactions.length ? (
              <div className="timeline">
                {rel.interactions.map((i: any, idx: number) => (
                  <div className="ev" key={i.id}>
                    <div className={`dot ${idx === 0 ? "now" : ""}`} />
                    <div><div className="t">{label(i.type)}{i.outcome ? ` · ${i.outcome}` : ""}</div><div className="d">{i.notes ?? ""}</div></div>
                    <div className="ts">{new Date(i.occurred_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No interactions logged yet.</p>}
          </div>

          {rel.tasks.length > 0 && (
            <div className="panel">
              <div className="panel-h"><h4>Tasks</h4><span className="sub">{rel.tasks.length}</span></div>
              {rel.tasks.map((t: any) => (
                <div className="doc-row" key={t.id}>☑ {t.title}<span className="end">{label(t.status)}</span></div>
              ))}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Contact</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Email</span><span className="v">{c.email ?? "—"}</span></div>
              <div className="sr"><span className="k">Phone</span><span className="v">{c.phone ?? "—"}</span></div>
              <div className="sr"><span className="k">Company</span><span className="v">{c.company?.name ?? "—"}</span></div>
              <div className="sr"><span className="k">Source</span><span className="v">{c.source ?? "—"}</span></div>
              <div className="sr"><span className="k">Broker</span><span className="v">{c.broker?.full_name ?? "—"}</span></div>
              <div className="sr"><span className="k">GDPR consent</span><span className="v">{c.gdpr_consent ? "Yes" : "No"}</span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Log interaction</h4></div>
            <LogInteractionForm clientId={id} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
