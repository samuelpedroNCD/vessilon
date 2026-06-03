import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listTasks, taskStats } from "@/lib/queries/tasks";
import { setTaskStatus } from "@/lib/actions/tasks";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STATUS = ["todo", "in_progress", "waiting", "completed", "cancelled"];
const PRIORITY = ["high", "medium", "low"];

function linked(t: any): { href: string; name: string } | null {
  if (t.client) return { href: `/clients/${t.client.id}`, name: t.client.name };
  if (t.lead) return { href: `/leads/${t.lead.id}`, name: t.lead.name };
  if (t.yacht) return { href: `/fleet/${t.yacht.id}`, name: t.yacht.name };
  if (t.opportunity) return { href: `/pipeline/${t.opportunity.id}`, name: t.opportunity.title };
  return null;
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const [tasks, stats] = await Promise.all([
    listTasks(supabase, { status: sp.status, priority: sp.priority }) as Promise<any[]>,
    taskStats(supabase),
  ]);

  return (
    <AppShell active="tasks" user={shellUser(profile)}>
      <PageHeader title="Tasks" crumb="brokerage / tasks" actions={<Link href="/tasks/new" className="btn primary">+ New task</Link>} />
      <div className="kpi-row">
        <div className="kpi"><div className="l">Open</div><div className="v tnum">{stats.open}</div><div className="sub2">to do</div></div>
        <div className="kpi"><div className="l">Due today</div><div className="v tnum">{stats.dueToday}</div><div className="sub2">on your plate</div></div>
        <div className="kpi"><div className="l">Overdue</div><div className="v tnum alert">{stats.overdue}</div><div className="sub2">past due</div></div>
        <div className="kpi"><div className="l">Completed</div><div className="v tnum">{stats.completed}</div><div className="sub2">done</div></div>
      </div>
      <Toolbar
        current={{ status: sp.status, priority: sp.priority }}
        filters={[
          { name: "status", label: "All statuses", options: STATUS.map((s) => ({ value: s, label: label(s) })) },
          { name: "priority", label: "All priorities", options: PRIORITY.map((s) => ({ value: s, label: label(s) })) },
        ]}
      />
      {tasks.length === 0 ? (
        <EmptyState title="No tasks" message="Create a task to track your follow-ups." ctaLabel="+ New task" ctaHref="/tasks/new" />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th style={{ width: 36 }} /><th>Task</th><th>Linked to</th><th className="num">Due</th><th>Priority</th><th>Status</th></tr></thead>
            <tbody>
              {tasks.map((t) => {
                const ln = linked(t);
                const done = t.status === "completed";
                const overdue = !done && t.due_at && new Date(t.due_at).getTime() < Date.now();
                return (
                  <tr key={t.id} className={overdue ? "row-overdue" : undefined}>
                    <td>
                      <form action={setTaskStatus.bind(null, t.id, done ? "todo" : "completed")}>
                        <button type="submit" title={done ? "Reopen" : "Complete"} className={`task-check${done ? " done" : ""}`}>
                          {done ? "✓" : ""}
                        </button>
                      </form>
                    </td>
                    <td style={{ textDecoration: done ? "line-through" : undefined, color: done ? "var(--ink-3)" : undefined }}>
                      <strong style={{ fontWeight: 600 }}>{t.title}</strong>
                      {t.description && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{t.description}</div>}
                    </td>
                    <td>{ln ? <Link href={ln.href} className="row-link" style={{ color: "var(--accent)" }}>{ln.name}</Link> : "—"}</td>
                    <td className="tnum" style={{ color: overdue ? "var(--danger)" : undefined }}>{t.due_at ? new Date(t.due_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
                    <td><Pill tone={t.priority === "high" ? "danger" : t.priority === "low" ? "gray" : "warn"}>{label(t.priority)}</Pill></td>
                    <td><Pill tone={toneFor(t.status)}>{label(t.status)}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
