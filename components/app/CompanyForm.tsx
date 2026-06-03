import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TYPES = ["owner", "client", "partner", "broker", "other"];
function hum(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CompanyForm({
  action,
  company,
  submitLabel = "Save company",
}: {
  action: (fd: FormData) => void;
  company?: any;
  submitLabel?: string;
}) {
  const c = company ?? {};
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field full"><label>Name *</label><input name="name" defaultValue={c.name ?? ""} required placeholder="Acme Holdings Ltd" /></div>
        <div className="form-field"><label>Type</label><select name="type" defaultValue={c.type ?? "client"}>{TYPES.map((t) => <option key={t} value={t}>{hum(t)}</option>)}</select></div>
        <div className="form-field"><label>Country</label><input name="country" defaultValue={c.country ?? ""} /></div>
        <div className="form-field"><label>VAT / Tax ID</label><input name="vat_id" defaultValue={c.vat_id ?? ""} /></div>
        <div className="form-field"><label>Website</label><input name="website" defaultValue={c.website ?? ""} /></div>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/companies" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
