import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listOwnerReports } from "@/lib/queries/owner-reports";
import { generateOwnerReport } from "@/lib/actions/owner-reports";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { Pill } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OwnerReportsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const [reports, { data: owners }] = await Promise.all([
    listOwnerReports(supabase),
    supabase.from("owners").select("id, name").order("name"),
  ]);
  const os = (owners ?? []) as { id: string; name: string }[];

  return (
    <AppShell active="reports" user={shellUser(profile)}>
      <PageHeader title="Owner reports" crumb="management / owner reports" />

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-h"><h4>Generate a report</h4><span className="sub">compiles live activity metrics</span></div>
        {os.length === 0 ? <p className="doc-empty">Add an owner first.</p> : (
          <form action={generateOwnerReport} className="form-grid">
            <div className="form-field"><label>Owner *</label><select name="owner_id" required defaultValue="">{[<option key="" value="" disabled>Select…</option>, ...os.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)]}</select></div>
            <div className="form-field"><label>Title</label><input name="title" defaultValue="Quarterly owner report" /></div>
            <div className="form-field"><label>Period start</label><input name="period_start" type="date" /></div>
            <div className="form-field"><label>Period end</label><input name="period_end" type="date" /></div>
            <div className="form-actions" style={{ gridColumn: "1 / -1" }}><button className="btn primary sm" type="submit">Generate report</button></div>
          </form>
        )}
      </div>

      {reports.length === 0 ? (
        <EmptyState title="No reports yet" message="Generate a periodic statement for an owner — activity, enquiries, pipeline and charters compiled automatically." />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Report</th><th>Owner</th><th className="num">Generated</th><th>Status</th><th className="chev" /></tr></thead>
            <tbody>
              {reports.map((r: any) => (
                <tr key={r.id}>
                  <td><Link href={`/owner-reports/${r.id}`} className="vc-cell row-link stretch"><span className="nm">{r.title}</span></Link></td>
                  <td>{r.owner?.name ?? "—"}</td>
                  <td className="tnum">{r.generated_at ? new Date(r.generated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                  <td><Pill tone={r.status === "published" ? "ok" : "gray"}>{r.status === "published" ? "Published" : "Draft"}</Pill></td>
                  <td className="chev">›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
