import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getOpportunity, getOpportunityRelations, getStages } from "@/lib/queries/pipeline";
import { deleteOpportunity, moveStage } from "@/lib/actions/opportunities";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import AgentCard from "@/components/app/AgentCard";
import LogInteractionForm from "@/components/app/LogInteractionForm";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const o = (await getOpportunity(supabase, id)) as any;
  if (!o) notFound();
  const [rel, stages] = await Promise.all([getOpportunityRelations(supabase, id), getStages(supabase, o.lob)]);

  const curPos = o.stage?.position ?? 0;
  const prob = o.probability ?? o.stage?.probability ?? 0;
  const gross = (o.value ?? 0) * 0.1;

  return (
    <AppShell active="pipeline" user={shellUser(profile)}>
      <Link href={`/pipeline?lob=${o.lob}`} className="back">← Pipeline</Link>
      <PageHeader
        title={o.title}
        crumb={`brokerage / ${o.lob}`}
        sub={<><Pill tone={toneFor(o.status)}>{label(o.status)}</Pill><span>{label(o.lob)}</span>{o.value && <span>{money(o.value)}</span>}<span>{prob}% weighted</span></>}
        actions={
          <>
            <Link href={`/pipeline/${id}/edit`} className="btn outline sm">Edit</Link>
            <form action={deleteOpportunity.bind(null, id)}><button className="btn outline sm" type="submit">Delete</button></form>
          </>
        }
      />

      {/* stepper */}
      <div className="stepper">
        {(stages as any[]).filter((s) => !s.is_lost).map((s, i, arr) => {
          const state = s.position < curPos ? "done" : s.position === curPos ? "active" : "todo";
          return (
            <span key={s.id} style={{ display: "contents" }}>
              <span className={`step ${state}`}>
                <span className="sn">{state === "done" ? "✓" : i + 1}</span>
                <span className="sl">{s.name}</span>
              </span>
              {i < arr.length - 1 && <span className="arrow">→</span>}
            </span>
          );
        })}
      </div>

      {/* move-stage control */}
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-h"><h4>Move stage</h4><span className="sub">current · {o.stage?.name ?? "—"}</span></div>
        <form action={moveStage.bind(null, id)} className="movebar">
          <select name="stage_id" defaultValue={o.stage_id ?? ""}>
            {(stages as any[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn primary sm" type="submit">Update stage</button>
        </form>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Negotiation &amp; activity</h4><span className="sub">{rel.interactions.length} logged</span></div>
            {rel.interactions.length ? (
              <div className="timeline">
                {rel.interactions.map((i: any, idx: number) => (
                  <div className="ev" key={i.id}>
                    <div className={`dot ${idx === 0 ? "now" : ""}`} />
                    <div><div className="t">{label(i.type)}{i.outcome ? ` · ${i.outcome}` : ""}{i.broker?.full_name ? ` · ${i.broker.full_name}` : ""}</div><div className="d">{i.notes ?? ""}</div></div>
                    <div className="ts">{new Date(i.occurred_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No activity yet.</p>}
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Log activity</h4></div>
            <LogInteractionForm opportunityId={id} clientId={o.client?.id} yachtId={o.yacht?.id} />
          </div>

          {rel.tasks.length > 0 && (
            <div className="panel">
              <div className="panel-h"><h4>Tasks</h4></div>
              {rel.tasks.map((t: any) => <div className="doc-row" key={t.id}>☑ {t.title}<span className="end">{label(t.status)}</span></div>)}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Deal</h4></div>
            <div className="mini-kpis">
              <div className="mini-kpi"><div className="l">Value</div><div className="v">{o.value ? money(o.value) : "—"}</div></div>
              <div className="mini-kpi"><div className="l">Probability</div><div className="v">{prob}%</div></div>
              <div className="mini-kpi"><div className="l">Weighted</div><div className="v">{money((o.value ?? 0) * (prob / 100))}</div></div>
              <div className="mini-kpi"><div className="l">Close</div><div className="v">{o.expected_close ? new Date(o.expected_close).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</div></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Linked records</h4></div>
            <div className="linked-records">
              {o.yacht && <Link href={`/fleet/${o.yacht.id}`} className="lr row-link"><span className={`ic vthumb ${o.yacht.hero_color ?? ""}`} /><span className="nm">{o.yacht.name}<small>{o.yacht.builder ?? ""}{o.yacht.loa_m ? ` · ${o.yacht.loa_m}m` : ""}</small></span><span className="end">{o.yacht.price ? money(o.yacht.price) : ""}</span></Link>}
              {o.client && <Link href={`/clients/${o.client.id}`} className="lr row-link"><span className="ic">CL</span><span className="nm">{o.client.name}<small>Client</small></span></Link>}
              <div className="lr"><span className="ic">BR</span><span className="nm">{o.broker?.full_name ?? "Unassigned"}<small>Broker</small></span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Commission</h4><span className="sub">est.</span></div>
            <div className="commission">
              <div className="cr"><span>Gross @ 10%</span><b>{money(gross)}</b></div>
              <div className="cr"><span>Co-broke split</span><b>50 / 50</b></div>
              <hr />
              <div className="cr net"><span>Our net</span><b>{money(gross / 2)}</b></div>
            </div>
          </div>

          <AgentCard
            title="Negotiation agent"
            body={<>I can draft the next move on <b>{o.title}</b> from comps and the latest activity — and flag what blocks closing.</>}
            primary="Draft next step"
          />
        </div>
      </div>
    </AppShell>
  );
}
