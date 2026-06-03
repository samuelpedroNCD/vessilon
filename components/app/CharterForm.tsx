import Link from "next/link";
import { CHARTER_STATUSES } from "@/lib/queries/charters";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CharterForm({
  action, row, yachts, clients, submitLabel = "Save",
}: {
  action: (fd: FormData) => void;
  row?: any;
  yachts: { id: string; name: string }[];
  clients: { id: string; name: string }[];
  submitLabel?: string;
}) {
  const r = row ?? {};
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="form-field"><label>Yacht</label><select name="yacht_id" defaultValue={r.yacht_id ?? ""}><option value="">—</option>{yachts.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></div>
        <div className="form-field"><label>Client</label><select name="client_id" defaultValue={r.client_id ?? ""}><option value="">—</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="form-field"><label>Start</label><input name="start_on" type="date" defaultValue={r.start_on ?? ""} /></div>
        <div className="form-field"><label>End</label><input name="end_on" type="date" defaultValue={r.end_on ?? ""} /></div>
        <div className="form-field"><label>Status</label><select name="status" defaultValue={r.status ?? "enquiry"}>{CHARTER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="form-field"><label>Destination</label><input name="destination" defaultValue={r.destination ?? ""} placeholder="West Med" /></div>
        <div className="form-field"><label>Gross fee</label><input name="gross_fee" type="number" defaultValue={r.gross_fee ?? ""} /></div>
        <div className="form-field"><label>APA</label><input name="apa" type="number" defaultValue={r.apa ?? ""} /></div>
        <div className="form-field"><label>Currency</label><select name="currency" defaultValue={r.currency ?? "EUR"}><option>EUR</option><option>USD</option><option>GBP</option></select></div>
        <div className="form-field"><label>Guests</label><input name="guests" type="number" defaultValue={r.guests ?? ""} /></div>
        <div className="form-field full"><label>Notes</label><textarea name="notes" defaultValue={r.notes ?? ""} /></div>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href="/charters" className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
