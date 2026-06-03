import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getLead, getLeadRelations } from "@/lib/queries/leads";
import { convertLead, deleteLead } from "@/lib/actions/leads";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import AgentCard from "@/components/app/AgentCard";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const l = (await getLead(supabase, id)) as any;
  if (!l) notFound();
  const rel = await getLeadRelations(supabase, id);
  const converted = !!l.converted_client_id;

  return (
    <AppShell active="leads" user={shellUser(profile)}>
      <Link href="/leads" className="back">← Leads</Link>
      <PageHeader
        title={l.name ?? "Lead"}
        crumb="brokerage / leads"
        sub={<><Pill tone={toneFor(l.status)}>{label(l.status)}</Pill>{l.temperature && <Pill tone={toneFor(l.temperature)}>{label(l.temperature)}</Pill>}<span>{label(l.lob)}</span></>}
        actions={
          <>
            {converted ? (
              <Link href={`/clients/${l.converted_client_id}`} className="btn outline sm">View client →</Link>
            ) : (
              <form action={convertLead.bind(null, id)}><button className="btn primary sm" type="submit">Convert to client</button></form>
            )}
            <Link href={`/leads/${id}/edit`} className="btn outline sm">Edit</Link>
            <form action={deleteLead.bind(null, id)}><button className="btn outline sm" type="submit">Delete</button></form>
          </>
        }
      />

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Recent activity</h4><span className="sub">{rel.interactions.length}</span></div>
            {rel.interactions.length ? (
              <div className="timeline">
                {rel.interactions.map((i: any, idx: number) => (
                  <div className="ev" key={i.id}>
                    <div className={`dot ${idx === 0 ? "now" : ""}`} />
                    <div><div className="t">{label(i.type)}</div><div className="d">{i.notes ?? ""}</div></div>
                    <div className="ts">{new Date(i.occurred_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No activity logged yet.</p>}
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Opportunities</h4><span className="sub">{rel.opps.length}</span></div>
            {rel.opps.length ? (
              <div className="linked-records">
                {rel.opps.map((o: any) => (
                  <Link href={`/pipeline/${o.id}`} className="lr row-link" key={o.id}><span className="ic">OP</span><span className="nm">{o.title}<small>{o.stage?.name ?? ""}</small></span><span className="end">{o.value ? money(o.value) : "—"}</span></Link>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No linked opportunities.</p>}
          </div>
        </div>

        <div className="stack">
          <AgentCard
            title="Intake agent"
            body={<>Classified <b>{label(l.lob)}</b>{l.ai_confidence != null ? ` at ${Math.round(l.ai_confidence * 100)}% confidence` : ""}. {converted ? "Already converted to a client." : "I can match the brief to live fleet and draft a first reply."}</>}
            primary={converted ? "View client" : "Match & draft"}
          />
          <div className="panel">
            <div className="panel-h"><h4>Contact</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Email</span><span className="v">{l.email ?? "—"}</span></div>
              <div className="sr"><span className="k">Phone</span><span className="v">{l.phone ?? "—"}</span></div>
              <div className="sr"><span className="k">Source</span><span className="v">{l.source ?? "—"}</span></div>
              <div className="sr"><span className="k">AI confidence</span><span className="v">{l.ai_confidence != null ? `${Math.round(l.ai_confidence * 100)}%` : "—"}</span></div>
              <div className="sr"><span className="k">Broker</span><span className="v">{l.broker?.full_name ?? "—"}</span></div>
              <div className="sr"><span className="k">Do not contact</span><span className="v">{l.do_not_contact ? "Yes" : "No"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
