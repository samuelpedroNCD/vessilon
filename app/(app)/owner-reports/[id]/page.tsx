import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getOwnerReport } from "@/lib/queries/owner-reports";
import { updateOwnerReportNarrative, setOwnerReportStatus, deleteOwnerReport } from "@/lib/actions/owner-reports";
import { METRIC_DEFS, metricValue } from "@/lib/owner-report-metrics";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ConfirmForm from "@/components/app/ConfirmForm";
import CopyLinkButton from "@/components/app/CopyLinkButton";
import { Pill } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OwnerReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const r = (await getOwnerReport(supabase, id)) as any;
  if (!r) notFound();
  const published = r.status === "published";
  const metrics = (r.metrics ?? {}) as Record<string, number>;
  const period = [r.period_start, r.period_end].filter(Boolean).map((d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })).join(" – ");

  return (
    <AppShell active="reports" user={shellUser(profile)}>
      <Link href="/owner-reports" className="back">← Owner reports</Link>
      <PageHeader
        title={r.title}
        crumb="management / owner reports"
        sub={<><Pill tone={published ? "ok" : "gray"}>{published ? "Published" : "Draft"}</Pill>{r.owner?.name && <span>{r.owner.name}</span>}{period && <span>{period}</span>}</>}
        actions={
          <>
            <form action={setOwnerReportStatus.bind(null, id, published ? "draft" : "published")}><button className={`btn ${published ? "outline" : "primary"} sm`} type="submit">{published ? "Unpublish" : "Publish"}</button></form>
            {published && r.share_token ? <Link href={`/r/${r.share_token}`} target="_blank" className="btn outline sm">View ↗</Link> : null}
            <ConfirmForm action={deleteOwnerReport.bind(null, id)} message="Delete this report?"><button className="btn outline sm" type="submit">Delete</button></ConfirmForm>
          </>
        }
      />

      <div className="kpi-row">
        {METRIC_DEFS.slice(0, 4).map((d) => (
          <div className="kpi" key={d.key}><div className="l">{d.label}</div><div className="v tnum">{metricValue(d, metrics)}</div></div>
        ))}
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Narrative</h4></div>
            <form action={updateOwnerReportNarrative.bind(null, id)} className="form-grid">
              <div className="form-field full"><label>Title</label><input name="title" defaultValue={r.title} /></div>
              <div className="form-field full"><label>Owner-facing summary</label><textarea name="narrative" defaultValue={r.narrative ?? ""} rows={6} placeholder="Dear owner, this quarter we…" /></div>
              <div className="form-actions" style={{ gridColumn: "1 / -1" }}><button className="btn primary sm" type="submit">Save</button></div>
            </form>
          </div>
          {published && r.share_token && (
            <div className="panel">
              <div className="panel-h"><h4>Share</h4></div>
              <div className="doc-empty" style={{ display: "flex", alignItems: "center", gap: 10 }}>Public link is live. <CopyLinkButton path={`/r/${r.share_token}`} label="Copy link" /></div>
            </div>
          )}
        </div>
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>All metrics</h4></div>
            <div className="spec-grid">
              {METRIC_DEFS.map((d) => (
                <div className="sr" key={d.key}><span className="k">{d.label}</span><span className="v">{metricValue(d, metrics)}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
