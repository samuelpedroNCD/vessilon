import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STATUSES = ["draft", "active", "under_offer", "conditional", "sold", "off_market", "expired", "charter_only", "new_build", "co_ownership"];
const LOBS = ["sale", "charter", "new_build", "co_ownership", "trade", "services"];
const SPEC_FIELDS: [string, string][] = [
  ["beam", "Beam"], ["gross_tonnage", "Gross tonnage"], ["guests", "Guests"], ["cabins", "Cabins"],
  ["engines", "Engines"], ["cruise", "Cruise (kn)"], ["max_speed", "Max (kn)"], ["range", "Range"],
  ["fuel", "Fuel"], ["naval_architect", "Naval architect"], ["refit_year", "Refit year"],
  ["flag", "Flag"], ["class", "Class"], ["hull_material", "Hull material"], ["tender", "Tender"],
];

function hum(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function YachtForm({
  action,
  yacht,
  brokers,
  owners,
  submitLabel = "Save yacht",
}: {
  action: (fd: FormData) => void;
  yacht?: any;
  brokers: { id: string; full_name: string | null }[];
  owners: { id: string; name: string }[];
  submitLabel?: string;
}) {
  const y = yacht ?? {};
  const specs = (y.specs ?? {}) as Record<string, string>;
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field full"><label>Name *</label><input name="name" defaultValue={y.name ?? ""} required placeholder="M/Y Aurora" /></div>
        <div className="form-field"><label>Type</label><select name="type" defaultValue={y.type ?? "motor"}><option value="motor">Motor</option><option value="sail">Sail</option></select></div>
        <div className="form-field"><label>Builder</label><input name="builder" defaultValue={y.builder ?? ""} /></div>
        <div className="form-field"><label>Year</label><input name="year" type="number" defaultValue={y.year ?? ""} /></div>
        <div className="form-field"><label>LOA (m)</label><input name="loa_m" type="number" step="0.1" defaultValue={y.loa_m ?? ""} /></div>
        <div className="form-field"><label>Price</label><input name="price" type="number" defaultValue={y.price ?? ""} /></div>
        <div className="form-field"><label>Currency</label><select name="currency" defaultValue={y.currency ?? "USD"}><option>USD</option><option>EUR</option><option>GBP</option></select></div>
        <div className="form-field"><label>Line of business</label><select name="lob" defaultValue={y.lob ?? "sale"}>{LOBS.map((l) => <option key={l} value={l}>{hum(l)}</option>)}</select></div>
        <div className="form-field"><label>Status</label><select name="status" defaultValue={y.status ?? "active"}>{STATUSES.map((s) => <option key={s} value={s}>{hum(s)}</option>)}</select></div>
        <div className="form-field"><label>Region</label><input name="region" defaultValue={y.region ?? ""} /></div>
        <div className="form-field"><label>Hull / HIN</label><input name="hull_id" defaultValue={y.hull_id ?? ""} /></div>
        <div className="form-field"><label>IMO</label><input name="imo" defaultValue={y.imo ?? ""} /></div>
        <div className="form-field"><label>Owner</label><select name="owner_id" defaultValue={y.owner_id ?? ""}><option value="">— None —</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
        <div className="form-field"><label>Primary broker</label><select name="primary_broker" defaultValue={y.primary_broker ?? ""}><option value="">— Unassigned —</option>{brokers.map((b) => <option key={b.id} value={b.id}>{b.full_name ?? "—"}</option>)}</select></div>
        <div className="form-field"><label>Thumbnail</label><select name="hero_color" defaultValue={y.hero_color ?? ""}><option value="">Teal</option><option value="b">Brown</option><option value="c">Blue</option><option value="d">Dark</option></select></div>

        <div className="form-section">Specifications</div>
        {SPEC_FIELDS.map(([k, lbl]) => (
          <div className="form-field" key={k}>
            <label>{lbl}</label>
            <input name={`spec_${k}`} defaultValue={specs[k] ?? ""} />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/fleet" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
