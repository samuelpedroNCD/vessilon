import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getCalendar } from "@/lib/queries/calendar";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";

/* eslint-disable @typescript-eslint/no-explicit-any */
const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const { meta, events } = await getCalendar(supabase, sp.m);
  const todayKey = new Date().toISOString().slice(0, 10);

  // build leading blanks + day cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < meta.firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= meta.daysInMonth; d++) cells.push(d);
  const total = Object.values(events).reduce((s, a) => s + a.length, 0);

  return (
    <AppShell active="calendar" user={shellUser(profile)}>
      <PageHeader
        title="Calendar"
        crumb="overview / calendar"
        actions={
          <span className="cal-nav">
            <Link href={`/calendar?m=${meta.prev}`} className="btn outline sm">←</Link>
            <span className="cal-month">{meta.label}</span>
            <Link href={`/calendar?m=${meta.next}`} className="btn outline sm">→</Link>
          </span>
        }
      />
      <div className="page-sub"><span>{total} events this month</span><span>·</span><span>tasks, charters, closings, certificate expiries</span></div>

      <div className="panel" style={{ padding: 14 }}>
        <div className="cal-grid cal-head">{WD.map((w) => <div className="cal-wd" key={w}>{w}</div>)}</div>
        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <div className="cal-cell empty" key={`b${i}`} />;
            const key = `${meta.match}-${String(d).padStart(2, "0")}`;
            const evs = events[key] ?? [];
            return (
              <div className={`cal-cell${key === todayKey ? " today" : ""}`} key={key}>
                <div className="cal-day">{d}</div>
                {evs.slice(0, 4).map((e: any, j: number) => (
                  <Link href={e.href} key={j} className={`cal-ev ${e.tone}`} title={e.title}>{e.title}</Link>
                ))}
                {evs.length > 4 && <div className="cal-more">+{evs.length - 4} more</div>}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
