import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getStages, boardData, listOpportunities, pipelineStats, LOBS } from "@/lib/queries/pipeline";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PipelinePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const lob = LOBS.includes(sp.lob ?? "") ? (sp.lob as string) : "sale";
  const view = sp.view === "list" ? "list" : "board";
  const supabase = await createClient();

  const stats = await pipelineStats(supabase);

  const tabs = (
    <div className="lobtabs">
      {LOBS.map((l) => (
        <Link key={l} href={`/pipeline?lob=${l}${view === "list" ? "&view=list" : ""}`} className={l === lob ? "active" : ""}>{label(l)}</Link>
      ))}
      <div className="viewtoggle">
        <Link href={`/pipeline?lob=${lob}`} className={view === "board" ? "active" : ""}>Board</Link>
        <Link href={`/pipeline?lob=${lob}&view=list`} className={view === "list" ? "active" : ""}>List</Link>
      </div>
    </div>
  );

  return (
    <AppShell active="pipeline" user={shellUser(profile)}>
      <PageHeader title="Pipeline" crumb={`brokerage / ${lob}`} actions={<Link href={`/pipeline/new?lob=${lob}`} className="btn primary">+ New deal</Link>} />

      <div className="kpi-row">
        <div className="kpi"><div className="l">Weighted pipeline</div><div className="v tnum">{money(stats.weighted)}</div></div>
        <div className="kpi"><div className="l">Gross open</div><div className="v tnum">{money(stats.gross)}</div></div>
        <div className="kpi"><div className="l">Open deals</div><div className="v tnum">{stats.openCount}</div></div>
        <div className="kpi"><div className="l">Won</div><div className="v tnum">{stats.wonCount}</div></div>
      </div>

      {tabs}

      {view === "list" ? <PipelineList supabase={supabase} lob={lob} /> : <PipelineBoard supabase={supabase} lob={lob} />}
    </AppShell>
  );
}

async function PipelineBoard({ supabase, lob }: { supabase: any; lob: string }) {
  const [stages, opps] = await Promise.all([getStages(supabase, lob), boardData(supabase, lob)]);
  if (stages.length === 0) {
    return <EmptyState title="No stages configured" message="This line of business has no pipeline stages yet." />;
  }
  return (
    <div className="kanban">
      {stages.map((s: any) => {
        const items = (opps as any[]).filter((o) => o.stage_id === s.id);
        const total = items.reduce((a, o) => a + (o.value ?? 0), 0);
        return (
          <div className="col" key={s.id}>
            <div className="col-h">
              <span className={`dot ${s.is_won ? "won" : s.is_lost ? "lost" : ""}`} />
              <span className="nm">{s.name}</span>
              <span className="ct">{items.length}</span>
            </div>
            {total > 0 && <div className="col-tot">{money(total)}</div>}
            {items.length === 0 ? (
              <div className="empty-col">—</div>
            ) : (
              items.map((o) => (
                <Link href={`/pipeline/${o.id}`} className="deal" key={o.id}>
                  <div className="dtop">
                    <span className={`dthumb vthumb ${o.yacht?.hero_color ?? ""}`} />
                    <span className="dnm">{o.title}<small>{o.yacht?.name ?? o.client?.name ?? o.lead?.name ?? ""}</small></span>
                  </div>
                  <div className="dval"><span>{o.client?.name ?? "—"}</span>{o.value ? money(o.value) : "—"}</div>
                </Link>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

async function PipelineList({ supabase, lob }: { supabase: any; lob: string }) {
  const opps = (await listOpportunities(supabase, { lob })) as any[];
  if (opps.length === 0) {
    return <EmptyState title="No deals" message="Add a deal to start this pipeline." ctaLabel="+ New deal" ctaHref={`/pipeline/new?lob=${lob}`} />;
  }
  return (
    <div className="panel" style={{ padding: 0 }}>
      <table className="tbl">
        <thead><tr><th>Deal</th><th>Stage</th><th>Client</th><th>Yacht</th><th className="num">Value</th><th className="num">Close</th><th>Status</th><th className="chev" /></tr></thead>
        <tbody>
          {opps.map((o) => (
            <tr key={o.id}>
              <td><Link href={`/pipeline/${o.id}`} className="vc-cell row-link stretch"><span className="nm">{o.title}</span></Link></td>
              <td>{o.stage?.name ?? "—"}</td>
              <td>{o.client?.name ?? "—"}</td>
              <td>{o.yacht?.name ?? "—"}</td>
              <td className="tnum">{o.value ? money(o.value) : "—"}</td>
              <td className="tnum">{o.expected_close ? new Date(o.expected_close).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
              <td><Pill tone={toneFor(o.status)}>{label(o.status)}</Pill></td>
              <td className="chev">›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
