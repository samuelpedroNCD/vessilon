import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app/AppShell";

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const fullName = meta.full_name || user.email?.split("@")[0] || "Broker";
  const firstName = fullName.split(" ")[0];
  const company = meta.company_name || "Your workspace";
  const initials =
    fullName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "V";

  const rail = (
    <>
      <div>
        <div className="rail-h"><span className="dot" /> Live activity</div>
        <div className="live-feed">
          <div className="l-item ok"><div className="ts">02:11</div><div className="body"><b>Counter</b> drafted · Astralis · $37.4M</div></div>
          <div className="l-item"><div className="ts">01:58</div><div className="body">Survey parsed · 41 findings · 6 critical</div></div>
          <div className="l-item warn"><div className="ts">01:44</div><div className="body">MCA LY3 expires 28d · <b>S/Y Polaris IV</b></div></div>
          <div className="l-item"><div className="ts">01:30</div><div className="body">3 buyer leads scored A-tier · YATCO sync</div></div>
          <div className="l-item ok"><div className="ts">00:54</div><div className="body">Brisant docs · signed by Vasquez</div></div>
          <div className="l-item"><div className="ts">00:12</div><div className="body">Caelum sea trial confirmed Fri 14:00 CET</div></div>
        </div>
      </div>

      <div>
        <div className="rail-h" style={{ color: "var(--signal)" }}><span className="dot" /> Today · agent proposes</div>
        <div className="agent-card">
          <div className="ah"><span className="pulse" /> Negotiation agent</div>
          <div className="body">
            <b>M/Y Astralis</b> · the buyer&rsquo;s offer is $2.3M below ask. I&rsquo;ve drafted a counter at <b>$37.4M</b> from 6 comps and the surveyor&rsquo;s 6 critical findings. Owner intent reads <em>soft motivated</em> — I led with terms, not price.
          </div>
          <div className="act">
            <button className="pri">Review draft</button>
            <button>Adjust</button>
            <button>Dismiss</button>
          </div>
        </div>
      </div>

      <div>
        <div className="rail-h">Today · your tasks</div>
        <div className="task done"><div className="ck done" /><div className="body">Confirm Caelum sea trial slot<small>Fri 06/13 · 14:00 CET</small></div><div className="due">10:30</div></div>
        <div className="task"><div className="ck" /><div className="body">Send Astralis counter to L. Bernet<small>after counter review</small></div><div className="due urgent">14:00</div></div>
        <div className="task"><div className="ck" /><div className="body">Call I. Vasquez · closing walkthrough<small>S/Y Brisant · 06/14</small></div><div className="due">15:30</div></div>
        <div className="task"><div className="ck" /><div className="body">Review Larkspur price-drop proposal<small>agent · suggests $69M (–$5M)</small></div><div className="due">16:00</div></div>
        <div className="task"><div className="ck" /><div className="body">Approve May owner reports (8)<small>auto-drafted · awaiting sign-off</small></div><div className="due">EOD</div></div>
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
        <span>4 agent drafts awaiting your review</span>
        <span>·</span>
        <span>YATCO + Boats Group + private feed</span>
      </div>

      {/* KPI ROW */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="l">Weighted pipeline</div>
          <div className="v tnum">$612<small>M</small></div>
          <div className="d pos">▲ $24.1M / 30d</div>
          <svg className="spark" viewBox="0 0 120 24" preserveAspectRatio="none"><path className="area" d="M0 22 L0 16 L15 14 L30 17 L45 12 L60 14 L75 9 L90 11 L105 6 L120 4 L120 22 Z" /><path d="M0 16 L15 14 L30 17 L45 12 L60 14 L75 9 L90 11 L105 6 L120 4" /></svg>
        </div>
        <div className="kpi">
          <div className="l">Active offers</div>
          <div className="v tnum">5</div>
          <div className="d pos">▲ 2 this week</div>
          <svg className="spark" viewBox="0 0 120 24" preserveAspectRatio="none"><path d="M0 18 L20 17 L40 14 L60 16 L80 12 L100 8 L120 6" stroke="var(--signal)" strokeWidth="1.4" fill="none" /></svg>
        </div>
        <div className="kpi">
          <div className="l">Closings · 30d</div>
          <div className="v tnum">3 <small>· $54M</small></div>
          <div className="d pos">▲ 1 vs last 30d</div>
          <svg className="spark" viewBox="0 0 120 24" preserveAspectRatio="none"><path d="M0 16 L20 15 L40 16 L60 12 L80 13 L100 10 L120 7" stroke="var(--accent)" strokeWidth="1.4" fill="none" /></svg>
        </div>
        <div className="kpi">
          <div className="l">Tasks due today</div>
          <div className="v tnum alert">5</div>
          <div className="d warn">2 urgent · 1 done</div>
          <svg className="spark" viewBox="0 0 120 24" preserveAspectRatio="none"><path d="M0 10 L20 12 L40 9 L60 13 L80 11 L100 14 L120 12" stroke="var(--signal)" strokeWidth="1.4" fill="none" /></svg>
        </div>
      </div>

      {/* PIPELINE SNAPSHOT */}
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-h">
          <h4>Pipeline by stage</h4>
          <span className="sub">128 listings · 47 active deals · $612M</span>
          <span className="actions">Open pipeline →</span>
        </div>
        <div className="stagebar">
          <div className="sr"><span className="nm"><span className="dot inq" />Inquiry</span><div className="track"><i className="fill inq" style={{ width: "100%" }} /></div><span className="amt">28 · $184M</span></div>
          <div className="sr"><span className="nm"><span className="dot sho" />Showing</span><div className="track"><i className="fill sho" style={{ width: "77%" }} /></div><span className="amt">11 · $142M</span></div>
          <div className="sr"><span className="nm"><span className="dot off" />Offer</span><div className="track"><i className="fill off" style={{ width: "53%" }} /></div><span className="amt">5 · $98M</span></div>
          <div className="sr"><span className="nm"><span className="dot clo" />Closing</span><div className="track"><i className="fill clo" style={{ width: "29%" }} /></div><span className="amt">3 · $54M</span></div>
          <div className="sr"><span className="nm"><span className="dot don" />Closed 30d</span><div className="track"><i className="fill don" style={{ width: "73%" }} /></div><span className="amt">12 · $134M</span></div>
        </div>
      </div>

      {/* SPLIT — agent activity + closings */}
      <div className="split">
        <div className="panel">
          <div className="panel-h">
            <h4>Recent agent activity</h4>
            <span className="sub">last 24h · 11 actions</span>
            <span className="actions">view all →</span>
          </div>
          <div className="feed">
            <div className="item"><div className="av-mini agent">VA</div><div><span className="who">Negotiation agent</span><br /><span className="body">Drafted counter at <b>$37.4M</b> on <b>M/Y Astralis</b> · 6 comps, MAE ±$0.4M · <em>ready for review</em></span></div><div className="ts">02:11</div></div>
            <div className="item"><div className="av-mini deal">{initials}</div><div><span className="who">{firstName}</span><br /><span className="body">Moved <b>S/Y Brisant</b> to <b>Closing</b> · signing 06/14 14:00 CET</span></div><div className="ts">01:48</div></div>
            <div className="item"><div className="av-mini agent">VA</div><div><span className="who">Survey agent</span><br /><span className="body">Parsed pre-purchase survey for <b>M/Y Astralis</b> · <b>41 findings</b> (6 critical, 14 major, 21 minor)</span></div><div className="ts">01:30</div></div>
            <div className="item"><div className="av-mini ok">SS</div><div><span className="who">Sina Senra</span><br /><span className="body">Logged 3 buyer inquiries on <b>M/Y Caelum</b> from YATCO sync · all A-tier</span></div><div className="ts">00:54</div></div>
            <div className="item"><div className="av-mini agent">VA</div><div><span className="who">Comps agent</span><br /><span className="body">Refreshed comps for <b>M/Y Larkspur</b> · suggests <b>price drop to $69M</b></span></div><div className="ts">yest.</div></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h4>Closing this week</h4>
            <span className="sub">3 vessels · $54.0M GTV</span>
            <span className="actions">view all →</span>
          </div>
          <table className="closings">
            <thead><tr><th>Vessel</th><th>Date</th><th>Stage</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td><div className="vc"><div className="th vthumb b" /><div className="nm">S/Y Brisant<small>BAL30912 · 33.1m</small></div></div></td><td>06 / 14 · Fri</td><td><span className="pill ok">docs signed</span></td><td className="tnum">$8.2M</td></tr>
              <tr><td><div className="vc"><div className="th vthumb c" /><div className="nm">M/Y Solenne<small>LIN44721 · 44.5m</small></div></div></td><td>06 / 16 · Sun</td><td><span className="pill warn">survey pending</span></td><td className="tnum">$19.5M</td></tr>
              <tr><td><div className="vc"><div className="th vthumb" /><div className="nm">M/Y Ardea<small>BEN72031 · 48.0m</small></div></div></td><td>06 / 18 · Tue</td><td><span className="pill ok">docs signed</span></td><td className="tnum">$26.3M</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
