import Link from "next/link";
import type { RefEntity } from "@/lib/dataroom/config";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function RefForm({
  entity,
  action,
  row,
  submitLabel = "Save",
}: {
  entity: RefEntity;
  action: (fd: FormData) => void;
  row?: any;
  submitLabel?: string;
}) {
  const r = row ?? {};
  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        {entity.fields.map((f) => (
          <div className={`form-field${f.kind === "textarea" ? " full" : ""}`} key={f.key}>
            <label>{f.label}{f.key === "name" ? " *" : ""}</label>
            {f.kind === "textarea" ? (
              <textarea name={f.key} defaultValue={r[f.key] ?? ""} />
            ) : f.kind === "select" ? (
              <select name={f.key} defaultValue={r[f.key] ?? ""}>
                <option value="">—</option>
                {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input name={f.key} type={f.kind === "number" ? "number" : f.kind === "email" ? "email" : "text"} required={f.key === "name"} defaultValue={r[f.key] ?? ""} />
            )}
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">{submitLabel}</button>
        <Link href={`/dataroom/${entity.slug}`} className="btn outline">Cancel</Link>
      </div>
    </form>
  );
}
