import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
const LOBS = ["sale", "charter", "new_build", "co_ownership", "trade", "services"];
function hum(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OpportunityForm({
  action,
  opp,
  clients,
  yachts,
  brokers,
  stages,
  submitLabel = "Save deal",
}: {
  action: (fd: FormData) => void;
  opp?: any;
  clients: { id: string; name: string }[];
  yachts: { id: string; name: string }[];
  brokers: { id: string; full_name: string | null }[];
  stages?: { id: string; name: string }[];
  submitLabel?: string;
}) {
  const o = opp ?? {};
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field full"><label>Title *</label><input name="title" defaultValue={o.title ?? ""} required placeholder="M/Y Aurora — Sale" /></div>
        <div className="form-field"><label>Line of business</label><select name="lob" defaultValue={o.lob ?? "sale"}>{LOBS.map((l) => <option key={l} value={l}>{hum(l)}</option>)}</select></div>
        {stages && (
          <div className="form-field"><label>Stage</label><select name="stage_id" defaultValue={o.stage_id ?? ""}>{stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        )}
        <div className="form-field"><label>Value</label><input name="value" type="number" defaultValue={o.value ?? ""} /></div>
        <div className="form-field"><label>Currency</label><select name="currency" defaultValue={o.currency ?? "USD"}><option>USD</option><option>EUR</option><option>GBP</option></select></div>
        <div className="form-field"><label>Expected close</label><input name="expected_close" type="date" defaultValue={o.expected_close ?? ""} /></div>
        <div className="form-field"><label>Client</label><select name="client_id" defaultValue={o.client_id ?? ""}><option value="">— None —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="form-field"><label>Yacht</label><select name="yacht_id" defaultValue={o.yacht_id ?? ""}><option value="">— None —</option>{yachts.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></div>
        <div className="form-field"><label>Broker</label><select name="assigned_broker" defaultValue={o.assigned_broker ?? ""}><option value="">— Me —</option>{brokers.map((b) => <option key={b.id} value={b.id}>{b.full_name ?? "—"}</option>)}</select></div>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/pipeline" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
