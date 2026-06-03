import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { METRIC_DEFS, metricValue } from "@/lib/owner-report-metrics";

export const dynamic = "force-dynamic";

type R = { title: string; period_start: string | null; period_end: string | null; metrics: Record<string, number>; narrative: string | null; generated_at: string | null; owner: string | null; org: string };

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_owner_report", { p_token: token });
  if (!data) return { title: "Report not found · Vessilon" };
  const r = data as R;
  return { title: `${r.title} — ${r.org}`, description: `Owner report for ${r.owner ?? "the fleet"}`, robots: { index: false } };
}

export default async function PublicOwnerReport({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_owner_report", { p_token: token });
  if (!data) notFound();
  const r = data as R;
  const metrics = (r.metrics ?? {}) as Record<string, number>;
  const period = [r.period_start, r.period_end].filter(Boolean).map((d) => new Date(d as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })).join(" – ");

  return (
    <main className="rep">
      <style>{`
        .rep { --teal:#0f3b2e; --signal:#b8743a; --paper:#fffefb; --ink:#15171a; --ink2:#5b6360; --line:#e7e4dc; background:var(--paper); color:var(--ink); min-height:100vh; font-family:system-ui,sans-serif; }
        .rep .nav { display:flex; align-items:center; justify-content:space-between; padding:18px 28px; border-bottom:1px solid var(--line); }
        .rep .brand { font-weight:700; } .rep .tag { font-size:12px; color:var(--ink2); text-transform:uppercase; letter-spacing:.08em; }
        .rep .wrap { max-width:880px; margin:0 auto; padding:40px 28px 64px; }
        .rep .eyebrow { font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--signal); }
        .rep h1 { font-size:clamp(26px,4vw,40px); letter-spacing:-.02em; margin:6px 0 4px; }
        .rep .sub { color:var(--ink2); margin:0 0 28px; }
        .rep .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; margin-bottom:30px; }
        .rep .kpi { border:1px solid var(--line); border-radius:12px; padding:16px 18px; background:#fff; }
        .rep .kpi .l { font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink2); }
        .rep .kpi .v { font-size:24px; font-weight:600; margin-top:6px; font-variant-numeric:tabular-nums; }
        .rep .narr { font-size:16px; line-height:1.7; white-space:pre-wrap; border-top:1px solid var(--line); padding-top:24px; }
        .rep .foot { border-top:1px solid var(--line); padding:22px 28px; color:var(--ink2); font-size:12px; text-align:center; }
      `}</style>
      <div className="nav"><div className="brand">{r.org}</div><div className="tag">Owner report</div></div>
      <div className="wrap">
        <div className="eyebrow">Prepared for {r.owner ?? "the owner"}</div>
        <h1>{r.title}</h1>
        <p className="sub">{period || (r.generated_at ? `Generated ${new Date(r.generated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : "")}</p>
        <div className="grid">
          {METRIC_DEFS.map((d) => (
            <div className="kpi" key={d.key}><div className="l">{d.label}</div><div className="v">{metricValue(d, metrics)}</div></div>
          ))}
        </div>
        {r.narrative && <div className="narr">{r.narrative}</div>}
      </div>
      <div className="foot">Presented by {r.org} · Powered by <a href="/" style={{ color: "inherit" }}>Vessilon</a></div>
    </main>
  );
}
