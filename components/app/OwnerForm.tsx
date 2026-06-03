import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function OwnerForm({
  action,
  owner,
  submitLabel = "Save owner",
}: {
  action: (fd: FormData) => void;
  owner?: any;
  submitLabel?: string;
}) {
  const o = owner ?? {};
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field full"><label>Name *</label><input name="name" defaultValue={o.name ?? ""} required placeholder="Owner or holding entity" /></div>
        <div className="form-field"><label>Email</label><input name="email" type="email" defaultValue={o.email ?? ""} /></div>
        <div className="form-field"><label>Phone</label><input name="phone" defaultValue={o.phone ?? ""} /></div>
        <div className="form-field full"><label>Notes</label><textarea name="notes" defaultValue={o.notes ?? ""} /></div>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/owners" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
