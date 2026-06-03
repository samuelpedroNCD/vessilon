import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app/AppShell";
import { getOverview, money, EMPTY_OVERVIEW, type Overview } from "@/lib/queries/overview";

function stageColor(name: string): string {
  const n = name.toLowerCase();
  if (/(enquiry|inquiry|brief|scope)/.test(n)) return "inq";
  if (/(viewing|showing|availability|shortlist|proposal)/.test(n)) return "sho";
  if (/(offer|negotiation|deposit|application|valuation)/.test(n)) return "off";
  if (/(conditional|survey|completion|contract|legal|build|part-exchange|agreement)/.test(n)) return "clo";
  if (/(closed|won|active|delivery|completed)/.test(n)) return "don";
  return "inq";
}

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile / org (resilient: tolerate a missing schema or unprovisioned user).
  type ProfileRow = {
    org_id: string;
    full_name: string | null;
    avatar_initials: string | null;
    org: { name: string } | null;
  };
  let profile: ProfileRow | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("org_id, full_name, avatar_initials, org:organisations(name)")
      .eq("id", user.id)
      .single();
    profile = (data as unknown as ProfileRow) ?? null;
  } catch {
    /* schema not ready — fall back to metadata */
  }

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const fullName = profile?.full_name || meta.full_name || user.email?.split("@")[0] || "Broker";
  const firstName = fullName.split(" ")[0];
  const company = profile?.org?.name || meta.company_name || "Your workspace";
  const initials =
    profile?.avatar_initials ||
    fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ||
    "V";

  let ov: Overview = EMPTY_OVERVIEW;
  if (profile?.org_id) {
    try {
      ov = await getOverview(supabase, profile.org_id, user.id);
    } catch {
      ov = EMPTY_OVERVIEW;
    }
  }

  const maxStage = Math.max(...ov.stages.map((s) => s.value), 1);
  const openDeals = ov.stages.filter((s) => s.position !== 999).reduce((a, s) => a + s.count, 0);
  const urgentTasks = ov.tasks.filter((t) => t.urgent).length;
  const doneTasks = ov.tasks.filter((t) => t.done).length;

  const rail = (
    <>
      <div>
        <div className="rail-h"><span className="dot" /> Live activity</div>
        {ov.activity.length > 0 ? (
          <div className="live-feed">
            {ov.activity.map((a, i) => (
              <div className="l-item" key={i}>
                <div className="ts">{a.ts}</div>
                <div className="body">{a.body}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "var(--ink-3)" }}>No activity logged yet.</p>
        )}
      </div>

      <div>
        <div className="rail-h" style={{ color: "var(--signal)" }}><span className="dot" /> Today · agent proposes</div>
        <div className="agent-card">
          <div className="ah"><span className="pulse" /> {ov.hasData ? "Negotiation agent" : "Onboarding agent"}</div>
          {ov.hasData ? (
            <div className="body">
              <b>M/Y Astralis</b> · the buyer&rsquo;s offer is $2.3M below ask. I&rsquo;ve drafted a counter at <b>$37.4M</b> from 6 comps and the surveyor&rsquo;s 6 critical findings. Owner intent reads <em>soft motivated</em> — I led with terms, not price.
            </div>
          ) : (
            <div className="body">
              Your workspace is ready. Add your first <b>yacht</b> and a <b>deal</b> and I&rsquo;ll start surfacing comps, drafting outreach, and flagging what needs you.
            </div>
          )}
          <div className="act">
            <button className="pri">{ov.hasData ? "Review draft" : "Add a yacht"}</button>
            <button>{ov.hasData ? "Adjust" : "Import fleet"}</button>
          </div>
        </div>
      </div>

      <div>
        <div className="rail-h">Today · your tasks</div>
        {ov.tasks.length > 0 ? (
          ov.tasks.map((t, i) => (
            <div className={`task${t.done ? " done" : ""}`} key={i}>
              <div className={`ck${t.done ? " done" : ""}`} />
              <div className="body">{t.title}{t.sub && <small>{t.sub}</small>}</div>
              <div className={`due${t.urgent ? " urgent" : ""}`}>{t.due}</div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 12, color: "var(--ink-3)" }}>No tasks due today.</p>
        )}
      </div>
    </>
  );

  return (
    <AppShell active="overview" user={{ name: fullName, email: user.email ?? "", company, initials }} rail={rail}>
      <div className="page-h">
        <h1>Welcome back, {firstName}</h1>
        <span className="crumb">/ {company.toLowerCase()} / today</span>
      </div>
      <div className="page-sub">
        <span className="live">Live · syncing every 14s</span>
        <span>·</span>
        <span>{ov.hasData ? `${openDeals} open deals` : "Empty workspace — add your fleet"}</span>
      </div>

      {/* KPI ROW */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="l">Weighted pipeline</div>
          <div className="v tnum">{money(ov.kpis.weightedPipeline)}</div>
          <div className="d pos">{openDeals} open deals</div>
        </div>
        <div className="kpi">
          <div className="l">Active offers</div>
          <div className="v tnum">{ov.kpis.activeOffers}</div>
          <div className="d pos">in offer stage</div>
        </div>
        <div className="kpi">
          <div className="l">Closings · 30d</div>
          <div className="v tnum">{ov.kpis.closings30d} <small>· {money(ov.kpis.closings30dValue)}</small></div>
          <div className="d pos">won · last 30d</div>
        </div>
        <div className="kpi">
          <div className="l">Tasks due today</div>
          <div className="v tnum alert">{ov.kpis.tasksDueToday}</div>
          <div className="d warn">{urgentTasks} urgent · {doneTasks} done</div>
        </div>
      </div>

      {/* PIPELINE SNAPSHOT */}
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-h">
          <h4>Pipeline by stage</h4>
          <span className="sub">{openDeals} active deals · {money(ov.stages.reduce((a, s) => a + (s.position !== 999 ? s.value : 0), 0))}</span>
          <span className="actions">Open pipeline →</span>
        </div>
        {ov.stages.length > 0 ? (
          <div className="stagebar">
            {ov.stages.map((s) => {
              const c = stageColor(s.name);
              return (
                <div className="sr" key={s.name}>
                  <span className="nm"><span className={`dot ${c}`} />{s.name}</span>
                  <div className="track"><i className={`fill ${c}`} style={{ width: `${Math.max(4, (s.value / maxStage) * 100)}%` }} /></div>
                  <span className="amt">{s.count} · {money(s.value)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No open opportunities yet. Add a deal to see your pipeline here.</p>
        )}
      </div>

      {/* SPLIT — agent activity + closings */}
      <div className="split">
        <div className="panel">
          <div className="panel-h">
            <h4>Recent activity</h4>
            <span className="sub">latest interactions</span>
            <span className="actions">view all →</span>
          </div>
          {ov.activity.length > 0 ? (
            <div className="feed">
              {ov.activity.map((a, i) => (
                <div className="item" key={i}>
                  <div className={`av-mini ${a.kind}`}>{initials}</div>
                  <div><span className="who">{a.who}</span><br /><span className="body">{a.body}</span></div>
                  <div className="ts">{a.ts}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Nothing logged yet — interactions you record will appear here.</p>
          )}
        </div>

        <div className="panel">
          <div className="panel-h">
            <h4>Closing this week</h4>
            <span className="sub">{ov.closings.length} vessels · {money(ov.closings.reduce((a, c) => a + c.value, 0))} GTV</span>
            <span className="actions">view all →</span>
          </div>
          {ov.closings.length > 0 ? (
            <table className="closings">
              <thead><tr><th>Vessel</th><th>Date</th><th>Stage</th><th>Value</th></tr></thead>
              <tbody>
                {ov.closings.map((c, i) => (
                  <tr key={i}>
                    <td><div className="vc"><div className={`th vthumb ${c.color}`} /><div className="nm">{c.yacht}<small>{c.sub}</small></div></div></td>
                    <td>{c.date}</td>
                    <td><span className="pill ok">{c.stage}</span></td>
                    <td className="tnum">{money(c.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No closings scheduled in the next 7 days.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
