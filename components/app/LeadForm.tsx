import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
const LOBS = ["sale", "charter", "new_build", "co_ownership", "trade", "services"];
const STATUSES = ["new", "contacted", "qualified", "converted", "unqualified", "lost"];
const TEMPS = ["hot", "warm", "cold"];

function hum(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LeadForm({
  action,
  lead,
  brokers,
  submitLabel = "Save lead",
}: {
  action: (fd: FormData) => void;
  lead?: any;
  brokers: { id: string; full_name: string | null }[];
  submitLabel?: string;
}) {
  const l = lead ?? {};
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field full"><label>Name</label><input name="name" defaultValue={l.name ?? ""} placeholder="Full name" /></div>
        <div className="form-field"><label>Email</label><input name="email" type="email" defaultValue={l.email ?? ""} /></div>
        <div className="form-field"><label>Phone</label><input name="phone" defaultValue={l.phone ?? ""} /></div>
        <div className="form-field"><label>Line of business</label><select name="lob" defaultValue={l.lob ?? "sale"}>{LOBS.map((x) => <option key={x} value={x}>{hum(x)}</option>)}</select></div>
        <div className="form-field"><label>Status</label><select name="status" defaultValue={l.status ?? "new"}>{STATUSES.map((x) => <option key={x} value={x}>{hum(x)}</option>)}</select></div>
        <div className="form-field"><label>Temperature</label><select name="temperature" defaultValue={l.temperature ?? ""}><option value="">—</option>{TEMPS.map((x) => <option key={x} value={x}>{hum(x)}</option>)}</select></div>
        <div className="form-field"><label>Source</label><input name="source" defaultValue={l.source ?? ""} placeholder="website form, referral…" /></div>
        <div className="form-field"><label>Assigned broker</label><select name="assigned_broker" defaultValue={l.assigned_broker ?? ""}><option value="">— Me —</option>{brokers.map((b) => <option key={b.id} value={b.id}>{b.full_name ?? "—"}</option>)}</select></div>
        <div className="form-field"><label>AI confidence (0–1)</label><input name="ai_confidence" type="number" step="0.01" min="0" max="1" defaultValue={l.ai_confidence ?? ""} /></div>
        <div className="form-field full" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input id="dnc" name="do_not_contact" type="checkbox" defaultChecked={!!l.do_not_contact} style={{ width: "auto" }} />
          <label htmlFor="dnc" style={{ textTransform: "none", fontSize: 13, color: "var(--ink-2)", letterSpacing: 0 }}>Do not contact (GDPR suppression)</label>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/leads" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
