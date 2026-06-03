import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getClosing, getClosingExtras, PARTY_ROLES, ESCROW_STATUSES } from "@/lib/queries/closings";
import { brokerOptions } from "@/lib/queries/fleet";
import { updateClosing, addMilestone, toggleMilestone, deleteMilestone, addParty, deleteParty, addSplit, deleteSplit } from "@/lib/actions/closings";
import { money } from "@/lib/queries/overview";
import { commissionRate } from "@/lib/commission";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import DocumentsPanel from "@/components/app/DocumentsPanel";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ClosingWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const o = (await getClosing(supabase, id)) as any;
  if (!o) notFound();
  const [x, brokers] = await Promise.all([getClosingExtras(supabase, id), brokerOptions(supabase)]);

  const gross = (o.value ?? 0) * commissionRate(o.lob);
  const splitPct = x.splits.reduce((s: number, r: any) => s + (Number(r.pct) || 0), 0);
  const doneCount = x.milestones.filter((m: any) => m.done).length;

  return (
    <AppShell active="closings" user={shellUser(profile)}>
      <Link href="/closings" className="back">← Closings</Link>
      <PageHeader
        title={o.title}
        crumb="brokerage / closings"
        sub={<><Pill tone={toneFor(o.status)}>{label(o.status)}</Pill><span>{o.yacht?.name ?? o.client?.name ?? ""}</span>{o.value ? <span>{money(o.value)}</span> : null}</>}
        actions={<Link href={`/pipeline/${id}`} className="btn outline sm">Open deal →</Link>}
      />

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Closing milestones</h4><span className="sub">{x.milestones.length ? `${doneCount}/${x.milestones.length}` : "0"}</span></div>
            {x.milestones.map((m: any) => (
              <div className="doc-row" key={m.id} style={{ gap: 10 }}>
                <form action={toggleMilestone.bind(null, m.id, id, !m.done)}>
                  <button type="submit" className={`task-check${m.done ? " done" : ""}`}>{m.done ? "✓" : ""}</button>
                </form>
                <span style={{ flex: 1, textDecoration: m.done ? "line-through" : undefined, color: m.done ? "var(--ink-3)" : undefined }}>
                  {m.title}{m.due_on ? <small style={{ color: "var(--ink-3)" }}> · due {new Date(m.due_on).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</small> : ""}
                </span>
                <form action={deleteMilestone.bind(null, m.id, id)}><button className="doc-del" type="submit" aria-label="Delete">✕</button></form>
              </div>
            ))}
            <form action={addMilestone.bind(null, id)} className="doc-upload-row" style={{ marginTop: 10 }}>
              <input name="title" className="doc-inp" placeholder="Milestone (e.g. Deposit in escrow)" required />
              <input name="due_on" type="date" className="doc-sel" />
              <button className="btn outline sm" type="submit">Add</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Parties</h4><span className="sub">{x.parties.length}</span></div>
            {x.parties.map((p: any) => (
              <div className="doc-row" key={p.id} style={{ gap: 10 }}>
                <span className="doc-ic">{label(p.role).slice(0, 2).toUpperCase()}</span>
                <span style={{ flex: 1 }}>{p.name}<small style={{ display: "block", color: "var(--ink-3)" }}>{label(p.role)}{p.email ? ` · ${p.email}` : ""}{p.phone ? ` · ${p.phone}` : ""}</small></span>
                <form action={deleteParty.bind(null, p.id, id)}><button className="doc-del" type="submit" aria-label="Delete">✕</button></form>
              </div>
            ))}
            <form action={addParty.bind(null, id)} className="doc-upload-row" style={{ marginTop: 10 }}>
              <select name="role" className="doc-sel" defaultValue="other">{PARTY_ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
              <input name="name" className="doc-inp" placeholder="Name" required />
              <input name="email" className="doc-inp" placeholder="Email" />
              <button className="btn outline sm" type="submit">Add</button>
            </form>
          </div>

          <DocumentsPanel entity="opportunity" entityId={id} revalidate={`/closings/${id}`} />
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Escrow &amp; date</h4></div>
            <form action={updateClosing.bind(null, id)} className="form-grid">
              <div className="form-field"><label>Closing date</label><input name="closing_date" type="date" defaultValue={o.closing_date ?? ""} /></div>
              <div className="form-field"><label>Escrow status</label><select name="escrow_status" defaultValue={o.escrow_status ?? ""}><option value="">—</option>{ESCROW_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
              <div className="form-field full"><label>Escrow amount</label><input name="escrow_amount" type="number" defaultValue={o.escrow_amount ?? ""} /></div>
              <div className="form-actions" style={{ gridColumn: "1 / -1" }}><button className="btn primary sm" type="submit">Save</button></div>
            </form>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Commission splits</h4><span className="sub">{Math.round(splitPct)}% of {money(gross)}</span></div>
            {splitPct !== 100 && x.splits.length > 0 && <div className="stub" style={{ marginBottom: 10 }}>Splits total {Math.round(splitPct)}% — should sum to 100%.</div>}
            {x.splits.map((s: any) => (
              <div className="doc-row" key={s.id} style={{ gap: 10 }}>
                <span style={{ flex: 1 }}>{s.broker?.full_name ?? s.name ?? "—"}</span>
                <span className="tnum" style={{ color: "var(--ink-2)" }}>{s.pct ? `${s.pct}%` : ""} {s.amount ? `· ${money(s.amount)}` : ""}</span>
                <form action={deleteSplit.bind(null, s.id, id)}><button className="doc-del" type="submit" aria-label="Delete">✕</button></form>
              </div>
            ))}
            <form action={addSplit.bind(null, id)} className="doc-upload-row" style={{ marginTop: 10 }}>
              <select name="broker_id" className="doc-sel" defaultValue=""><option value="">— Broker —</option>{brokers.map((b) => <option key={b.id} value={b.id}>{b.full_name ?? "—"}</option>)}</select>
              <input name="pct" type="number" className="doc-sel" placeholder="%" style={{ width: 70 }} />
              <button className="btn outline sm" type="submit">Add</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Snapshot</h4></div>
            <div className="mini-kpis">
              <div className="mini-kpi"><div className="l">Transaction</div><div className="v">{o.value ? money(o.value) : "—"}</div></div>
              <div className="mini-kpi"><div className="l">Gross commission</div><div className="v">{money(gross)}</div></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
