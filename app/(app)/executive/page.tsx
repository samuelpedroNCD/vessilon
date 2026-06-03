import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getExecutive } from "@/lib/queries/executive";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { label } from "@/components/app/Pill";

export default async function ExecutivePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const x = await getExecutive(supabase, profile.org_id);

  const maxLob = Math.max(1, ...x.lobs.map((l) => l.value));

  return (
    <AppShell active="executive" user={shellUser(profile)}>
      <PageHeader title="Executive" crumb="overview / executive" />

      {!x.hasData ? (
        <EmptyState title="No data yet" message="Add yachts and deals and the executive rollup populates automatically." />
      ) : (
        <>
          <div className="kpi-row">
            <div className="kpi"><div className="l">Weighted pipeline</div><div className="v tnum">{money(x.kpis.weighted)}</div><div className="sub2">{x.kpis.openCount} open · {money(x.kpis.openValue)} gross</div></div>
            <div className="kpi"><div className="l">Won this quarter</div><div className="v tnum">{money(x.kpis.wonQtdValue)}</div><div className="sub2">{x.kpis.wonQtdCount} deals closed</div></div>
            <div className="kpi"><div className="l">Win rate</div><div className="v tnum">{Math.round(x.kpis.winRate * 100)}%</div><div className="sub2">{x.kpis.wonQtdCount}/{x.kpis.decidedQtd} decided · quarter</div></div>
            <div className="kpi"><div className="l">Gross commission</div><div className="v tnum">{money(x.kpis.commissionEst)}</div><div className="sub2">estimated · all won</div></div>
          </div>

          <div className="two-col">
            <div className="stack">
              <div className="panel" style={{ padding: 0 }}>
                <div className="panel-h" style={{ padding: "14px 16px 0" }}><h4>Broker leaderboard</h4><span className="sub">{x.brokers.length}</span></div>
                <table className="tbl">
                  <thead>
                    <tr><th>Broker</th><th className="num">Open (wtd)</th><th className="num">Open&nbsp;#</th><th className="num">Won</th><th className="num">Won value</th></tr>
                  </thead>
                  <tbody>
                    {x.brokers.map((b) => (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td className="tnum">{money(b.openWeighted)}</td>
                        <td className="tnum">{b.openCount}</td>
                        <td className="tnum">{b.wonCount}</td>
                        <td className="tnum">{money(b.wonValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <div className="panel-h"><h4>Pipeline by line of business</h4></div>
                <div className="exec-bars">
                  {x.lobs.map((l) => (
                    <div className="exec-bar" key={l.lob}>
                      <div className="exec-bar-top">
                        <span>{label(l.lob)}</span>
                        <span className="tnum">{money(l.value)} · {l.count}</span>
                      </div>
                      <div className="exec-track"><div className="exec-fill" style={{ width: `${Math.round((l.value / maxLob) * 100)}%` }} /></div>
                    </div>
                  ))}
                  {x.lobs.length === 0 && <p className="doc-empty">No open pipeline.</p>}
                </div>
              </div>
            </div>

            <div className="stack">
              <div className="panel">
                <div className="panel-h"><h4>Fleet inventory</h4></div>
                <div className="mini-kpis">
                  <div className="mini-kpi"><div className="l">Listed value</div><div className="v">{money(x.kpis.inventoryValue)}</div></div>
                  <div className="mini-kpi"><div className="l">On market</div><div className="v">{x.kpis.fleetActive}</div></div>
                </div>
                <div className="spec-grid" style={{ marginTop: 12 }}>
                  {x.fleet.map((f) => (
                    <div className="sr" key={f.status}><span className="k">{label(f.status)}</span><span className="v">{f.count}</span></div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-h"><h4>Recent wins</h4><span className="sub">{x.recentWon.length}</span><a href="/pipeline?status=won" className="actions">View all →</a></div>
                {x.recentWon.length ? (
                  <div className="linked-records">
                    {x.recentWon.map((w, i) => (
                      <div className="lr" key={i}>
                        <span className="ic">★</span>
                        <span className="nm">{w.title}<small>{w.broker} · {w.when}</small></span>
                        <span className="end">{money(w.value)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="doc-empty">No closed deals yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
