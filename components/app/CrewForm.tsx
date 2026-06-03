import Link from "next/link";
import { CREW_STATUSES, CREW_POSITIONS } from "@/lib/queries/crew";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CrewForm({
  action,
  row,
  yachts,
  submitLabel = "Save",
}: {
  action: (fd: FormData) => void;
  row?: any;
  yachts: { id: string; name: string }[];
  submitLabel?: string;
}) {
  const r = row ?? {};
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field"><label>Name *</label><input name="name" required defaultValue={r.name ?? ""} /></div>
        <div className="form-field"><label>Position</label><select name="position" defaultValue={r.position ?? ""}><option value="">—</option>{CREW_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
        <div className="form-field"><label>Nationality</label><input name="nationality" defaultValue={r.nationality ?? ""} /></div>
        <div className="form-field"><label>Status</label><select name="status" defaultValue={r.status ?? "available"}>{CREW_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></div>
        <div className="form-field"><label>Email</label><input name="email" type="email" defaultValue={r.email ?? ""} /></div>
        <div className="form-field"><label>Phone</label><input name="phone" defaultValue={r.phone ?? ""} /></div>
        <div className="form-field"><label>Current vessel</label><select name="current_yacht_id" defaultValue={r.current_yacht_id ?? ""}><option value="">—</option>{yachts.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></div>
        <div className="form-field"><label>Day rate</label><input name="day_rate" type="number" defaultValue={r.day_rate ?? ""} /></div>
        <div className="form-field full"><label>Notes</label><textarea name="notes" defaultValue={r.notes ?? ""} /></div>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/crew" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
