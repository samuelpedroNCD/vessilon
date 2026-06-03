import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CATEGORIES = ["buyer", "seller", "charter_guest", "co_owner", "owner"];
const TEMPS = ["hot", "warm", "cold"];
function hum(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ClientForm({
  action,
  client,
  brokers,
  companies = [],
  submitLabel = "Save client",
}: {
  action: (fd: FormData) => void;
  client?: any;
  brokers: { id: string; full_name: string | null }[];
  companies?: { id: string; name: string }[];
  submitLabel?: string;
}) {
  const c = client ?? {};
  const cats: string[] = c.categories ?? [];
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field full"><label>Name *</label><input name="name" defaultValue={c.name ?? ""} required /></div>
        <div className="form-field"><label>Email</label><input name="email" type="email" defaultValue={c.email ?? ""} /></div>
        <div className="form-field"><label>Phone</label><input name="phone" defaultValue={c.phone ?? ""} /></div>
        <div className="form-field"><label>Temperature</label><select name="temperature" defaultValue={c.temperature ?? ""}><option value="">—</option>{TEMPS.map((t) => <option key={t} value={t}>{hum(t)}</option>)}</select></div>
        <div className="form-field"><label>Source</label><input name="source" defaultValue={c.source ?? ""} /></div>
        <div className="form-field"><label>Assigned broker</label><select name="assigned_broker" defaultValue={c.assigned_broker ?? ""}><option value="">— Me —</option>{brokers.map((b) => <option key={b.id} value={b.id}>{b.full_name ?? "—"}</option>)}</select></div>
        <div className="form-field"><label>Company</label><select name="company_id" defaultValue={c.company_id ?? ""}><option value="">— None —</option>{companies.map((co) => <option key={co.id} value={co.id}>{co.name}</option>)}</select></div>
        <div className="form-field full">
          <label>Categories</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
            {CATEGORIES.map((cat) => (
              <label key={cat} style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "none", letterSpacing: 0, color: "var(--ink-2)", fontFamily: "var(--font-sans)", fontSize: 13 }}>
                <input type="checkbox" name="categories" value={cat} defaultChecked={cats.includes(cat)} style={{ width: "auto" }} /> {hum(cat)}
              </label>
            ))}
          </div>
        </div>
        <div className="form-field full" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input id="gdpr" name="gdpr_consent" type="checkbox" defaultChecked={!!c.gdpr_consent} style={{ width: "auto" }} />
          <label htmlFor="gdpr" style={{ textTransform: "none", fontSize: 13, color: "var(--ink-2)", letterSpacing: 0 }}>Marketing consent (GDPR)</label>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/clients" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
