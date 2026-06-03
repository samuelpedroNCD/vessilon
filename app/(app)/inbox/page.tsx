import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getInbox } from "@/lib/queries/inbox";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import AgentCard from "@/components/app/AgentCard";
import { Pill } from "@/components/app/Pill";

function rel(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export default async function InboxPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const inbox = await getInbox(supabase, profile.org_id, profile.id);

  return (
    <AppShell active="inbox" user={shellUser(profile)}>
      <PageHeader title="Inbox" crumb="overview / inbox" />

      <div className="kpi-row">
        <div className="kpi"><div className="l">Activity</div><div className="v tnum">{inbox.unread}</div><div className="sub2">recent events</div></div>
        <div className="kpi"><div className="l">Open tasks</div><div className="v tnum">{inbox.tasks.length}</div><div className="sub2">assigned across org</div></div>
        <div className="kpi"><div className="l">Overdue</div><div className="v tnum">{inbox.overdue}</div><div className="sub2">need attention</div></div>
        <div className="kpi"><div className="l">Email</div><div className="v tnum">—</div><div className="sub2">not connected</div></div>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Activity feed</h4><span className="sub">{inbox.feed.length}</span></div>
            {inbox.feed.length ? (
              <div className="timeline">
                {inbox.feed.map((f, idx) => (
                  <div className="ev" key={f.id}>
                    <div className={`dot ${idx === 0 ? "now" : ""}`} />
                    <div>
                      <div className="t" style={{ textTransform: "capitalize" }}>
                        {f.title} {f.kind === "audit" && <span className="sub" style={{ fontSize: 11, color: "var(--ink-3)" }}>· {f.who ?? ""}</span>}
                      </div>
                      <div className="d">{f.body}</div>
                    </div>
                    <div className="ts">{rel(f.at)}</div>
                  </div>
                ))}
              </div>
            ) : <p className="doc-empty">Nothing yet — activity from across the workspace lands here.</p>}
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Connect email</h4></div>
            <div className="stub">
              <b>Email sync isn&rsquo;t connected yet.</b> Link a Gmail or Microsoft 365 mailbox (or an IMAP inbox) to triage client mail, auto-log replies against deals, and let agents draft responses in your voice.
              <div style={{ marginTop: 10 }}>
                <button className="btn outline sm" type="button" disabled title="Coming soon" style={{ cursor: "not-allowed" }}>Connect mailbox →</button>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Tasks</h4><span className="sub">{inbox.tasks.length}</span></div>
            {inbox.tasks.length ? (
              <div className="linked-records">
                {inbox.tasks.map((t) => (
                  <div className="lr" key={t.id}>
                    <span className="ic">☑</span>
                    <span className="nm">{t.title}
                      <small>{t.due_at ? new Date(t.due_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "no due date"}</small>
                    </span>
                    <span className="end">{t.overdue ? <Pill tone="danger">Overdue</Pill> : t.priority ? <Pill tone="gray">{t.priority}</Pill> : null}</span>
                  </div>
                ))}
              </div>
            ) : <p className="doc-empty">No open tasks.</p>}
            <div style={{ marginTop: 10 }}><Link href="/tasks" className="btn outline sm">All tasks →</Link></div>
          </div>

          <AgentCard
            title="Triage agent"
            body={<>You have <b>{inbox.overdue}</b> overdue task{inbox.overdue === 1 ? "" : "s"} and {inbox.feed.length} recent events. Connect a mailbox and I&rsquo;ll start drafting replies and flagging what needs you.</>}
            primary="Review queue"
          />
        </div>
      </div>
    </AppShell>
  );
}
