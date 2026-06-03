import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getOpportunity, getOpportunityRelations, getStages, getDealExtras } from "@/lib/queries/pipeline";
import { deleteOpportunity, moveStage, addOffer, toggleChecklistItem, seedClosingChecklist } from "@/lib/actions/opportunities";
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
  const [rel, stages, extras] = await Promise.all([
    getOpportunityRelations(supabase, id),
    getStages(supabase, o.lob),
    getDealExtras(supabase, id),
  ]);

  const curPos = o.stage?.position ?? 0;
  const prob = o.probability ?? o.stage?.probability ?? 0;
  const gross = (o.value ?? 0) * 0.1;
  const daysInStage = o.stage_entered_at ? Math.round((Date.now() - new Date(o.stage_entered_at).getTime()) / 86400000) : null;
  const slaDays: number | null = o.stage?.sla_days ?? null;
  const slaOver = slaDays != null && daysInStage != null && daysInStage > slaDays && o.status === "open";
  const detailEntries = Object.entries((o.details ?? {}) as Record<string, string>);
  const checkDone = extras.checklist.filter((c: any) => c.done).length;

  return (
    <AppShell active="pipeline" user={shellUser(profile)}>
      <Link href={`/pipeline?lob=${o.lob}`} className="back">← Pipeline</Link>
      <PageHeader
        title={o.title}
        crumb={`brokerage / ${o.lob}`}
        sub={<><Pill tone={toneFor(o.status)}>{label(o.status)}</Pill><span>{label(o.lob)}</span>{o.value && <span>{money(o.value)}</span>}<span>{prob}% weighted</span>{slaOver && <Pill tone="danger">{daysInStage}d in stage · SLA {slaDays}d</Pill>}{o.close_reason && <span style={{ color: "var(--ink-3)" }}>· {o.close_reason}</span>}</>}
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
          <input name="reason" placeholder="Reason (for won / lost)" style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--line-2)", borderRadius: 8, fontFamily: "inherit", fontSize: 13 }} />
          <button className="btn primary sm" type="submit">Update stage</button>
        </form>
        {daysInStage != null && <p style={{ fontSize: 11, color: slaOver ? "var(--danger)" : "var(--ink-3)", marginTop: 8 }}>{daysInStage} day{daysInStage === 1 ? "" : "s"} in this stage{slaDays != null ? ` · SLA ${slaDays}d` : ""}.</p>}
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Offers &amp; LOIs</h4><span className="sub">{extras.offers.length}</span></div>
            {extras.offers.length > 0 && (
              <table className="tbl" style={{ marginBottom: 14 }}>
                <thead><tr><th>Party</th><th>Type</th><th className="num">Amount</th><th>Status</th><th className="num">Response by</th></tr></thead>
                <tbody>
                  {extras.offers.map((of: any) => (
                    <tr key={of.id}>
                      <td>{of.party ?? "—"}</td>
                      <td>{label(of.kind)}</td>
                      <td className="tnum strong">{of.amount ? money(of.amount) : "—"}</td>
                      <td><Pill tone={of.status === "accepted" ? "ok" : of.status === "rejected" ? "danger" : "gray"}>{label(of.status)}</Pill></td>
                      <td className="tnum">{of.response_deadline ? new Date(of.response_deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <form action={addOffer.bind(null, id)}>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div className="form-field"><label>Party</label><input name="party" placeholder="Buyer / Our counter" /></div>
                <div className="form-field"><label>Type</label><select name="kind"><option value="offer">Offer</option><option value="counter">Counter</option><option value="loi">LOI</option></select></div>
                <div className="form-field"><label>Amount</label><input name="amount" type="number" /></div>
                <div className="form-field full"><label>Conditions</label><input name="conditions" placeholder="Subject to survey, finance…" /></div>
                <div className="form-field"><label>Response by</label><input name="response_deadline" type="date" /></div>
              </div>
              <div className="form-actions" style={{ marginTop: 12 }}><button className="btn primary sm" type="submit">Add offer</button></div>
            </form>
          </div>

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

          <div className="panel">
            <div className="panel-h">
              <h4>Closing checklist</h4>
              <span className="sub">{extras.checklist.length > 0 ? `${checkDone}/${extras.checklist.length}` : "—"}</span>
              {extras.checklist.length === 0 && (
                <form action={seedClosingChecklist.bind(null, id)} style={{ marginLeft: "auto" }}>
                  <button className="btn outline sm" type="submit">Generate</button>
                </form>
              )}
            </div>
            {extras.checklist.length > 0 ? (
              extras.checklist.map((c: any) => (
                <div className="doc-row" key={c.id} style={{ gap: 10 }}>
                  <form action={toggleChecklistItem.bind(null, c.id, id, !c.done)}>
                    <button type="submit" style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid var(--line-2)", background: c.done ? "var(--accent)" : "transparent", color: "var(--paper)", cursor: "pointer", fontSize: 11, lineHeight: 1 }}>{c.done ? "✓" : ""}</button>
                  </form>
                  <span style={{ textDecoration: c.done ? "line-through" : undefined, color: c.done ? "var(--ink-3)" : undefined }}>{c.label}</span>
                </div>
              ))
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Generate a standard closing checklist to track completion steps.</p>}
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Stage history</h4><span className="sub">{extras.events.length}</span></div>
            {extras.events.length > 0 ? (
              <div className="timeline">
                {extras.events.map((e: any) => (
                  <div className="ev" key={e.id}>
                    <div className={`dot ${e.kind === "won" ? "ok" : ""}`} />
                    <div>
                      <div className="t">{e.kind === "won" ? "Won" : e.kind === "lost" ? "Lost" : `${e.from_stage ?? "—"} → ${e.to_stage ?? "—"}`}{e.actor?.full_name ? ` · ${e.actor.full_name}` : ""}</div>
                      {e.note && <div className="d">{e.note}</div>}
                    </div>
                    <div className="ts">{new Date(e.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No stage changes recorded yet.</p>}
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

          {detailEntries.length > 0 && (
            <div className="panel">
              <div className="panel-h"><h4>{label(o.lob)} details</h4></div>
              <div className="spec-grid">
                {detailEntries.map(([k, v]) => (
                  <div className="sr" key={k}><span className="k">{label(k)}</span><span className="v">{v}</span></div>
                ))}
              </div>
            </div>
          )}

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
