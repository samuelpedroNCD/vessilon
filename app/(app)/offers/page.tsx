import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listOffers, offerStats, dealOptions, OFFER_STATUSES, OFFER_KINDS, type OfferFilters } from "@/lib/queries/offers";
import { setOfferStatus, deleteOffer, createStandaloneOffer } from "@/lib/actions/offers";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import ConfirmForm from "@/components/app/ConfirmForm";
import { Pill, label, type Tone } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TONE: Record<string, Tone> = { open: "info", countered: "warn", accepted: "ok", rejected: "danger", withdrawn: "gray", expired: "gray" };

export default async function OffersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const filters: OfferFilters = { status: sp.status, kind: sp.kind, q: sp.q };
  const supabase = await createClient();
  const [offers, stats, deals] = await Promise.all([listOffers(supabase, filters), offerStats(supabase), dealOptions(supabase)]);

  return (
    <AppShell active="offers" user={shellUser(profile)}>
      <PageHeader title="Offers" crumb="brokerage / offers" />

      <div className="kpi-row">
        <div className="kpi"><div className="l">Live offers</div><div className="v tnum">{stats.open}</div><div className="sub2">open / countered</div></div>
        <div className="kpi"><div className="l">Live value</div><div className="v tnum">{money(stats.liveValue)}</div><div className="sub2">on the table</div></div>
        <div className="kpi"><div className="l">Accepted</div><div className="v tnum">{stats.accepted}</div><div className="sub2">all-time</div></div>
        <div className="kpi"><div className="l">Closed out</div><div className="v tnum">{stats.rejected}</div><div className="sub2">rejected / withdrawn / expired</div></div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-h"><h4>Log an offer</h4><span className="sub">against a deal</span></div>
        {deals.length === 0 ? (
          <p className="doc-empty">Create a deal in the Pipeline first, then log offers against it.</p>
        ) : (
          <form action={createStandaloneOffer} className="form-grid">
            <div className="form-field full"><label>Deal *</label><select name="opportunity_id" required defaultValue="">{[<option key="" value="" disabled>Select a deal…</option>, ...deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)]}</select></div>
            <div className="form-field"><label>Party</label><input name="party" placeholder="Buyer / Our counter" /></div>
            <div className="form-field"><label>Type</label><select name="kind" defaultValue="offer">{OFFER_KINDS.map((k) => <option key={k} value={k}>{label(k)}</option>)}</select></div>
            <div className="form-field"><label>Amount</label><input name="amount" type="number" /></div>
            <div className="form-field"><label>Response by</label><input name="response_deadline" type="date" /></div>
            <div className="form-field full"><label>Conditions</label><input name="conditions" placeholder="Subject to survey, finance…" /></div>
            <div className="form-actions" style={{ gridColumn: "1 / -1" }}><button className="btn primary sm" type="submit">Log offer</button></div>
          </form>
        )}
      </div>

      <Toolbar
        current={filters as Record<string, string | undefined>}
        searchPlaceholder="Search party…"
        filters={[
          { name: "status", label: "All statuses", options: OFFER_STATUSES.map((s) => ({ value: s, label: label(s) })) },
          { name: "kind", label: "All types", options: OFFER_KINDS.map((k) => ({ value: k, label: label(k) })) },
        ]}
      />

      {offers.length === 0 ? (
        <EmptyState title="No offers" message="Offers logged here and inside deals appear in this register." />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Deal</th><th>Party</th><th>Type</th><th className="num">Amount</th><th className="num">Response by</th><th>Status</th><th /><th className="chev" /></tr></thead>
            <tbody>
              {offers.map((o: any) => (
                <tr key={o.id}>
                  <td><Link href={`/pipeline/${o.opportunity?.id}`} className="row-link" style={{ color: "var(--accent)" }}>{o.opportunity?.title ?? "—"}</Link><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.opportunity?.yacht?.name ?? o.opportunity?.client?.name ?? ""}</div></td>
                  <td>{o.party ?? "—"}</td>
                  <td>{label(o.kind)}</td>
                  <td className="tnum strong">{o.amount ? money(o.amount) : "—"}</td>
                  <td className="tnum">{o.response_deadline ? new Date(o.response_deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
                  <td><Pill tone={TONE[o.status] ?? "gray"}>{label(o.status)}</Pill></td>
                  <td>
                    <form action={setOfferStatus.bind(null, o.id)} className="rolechg">
                      <select name="status" defaultValue={o.status} style={{ padding: "5px 8px", border: "1px solid var(--line-2)", borderRadius: 6, fontSize: 12 }}>
                        {OFFER_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                      </select>
                      <button className="btn outline sm" type="submit">Set</button>
                    </form>
                  </td>
                  <td className="chev">
                    <ConfirmForm action={deleteOffer.bind(null, o.id)} message="Delete this offer?">
                      <button className="doc-del" type="submit" aria-label="Delete offer">✕</button>
                    </ConfirmForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
