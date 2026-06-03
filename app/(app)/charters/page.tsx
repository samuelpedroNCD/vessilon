import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listCharters, charterStats, groupByMonth, CHARTER_STATUSES } from "@/lib/queries/charters";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { Pill, label, type Tone } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TONE: Record<string, Tone> = { enquiry: "gray", option: "warn", confirmed: "ok", completed: "info", cancelled: "danger" };

function span(c: any): string {
  if (!c.start_on) return "Unscheduled";
  const s = new Date(c.start_on).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const e = c.end_on ? new Date(c.end_on).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "?";
  return `${s} → ${e}`;
}

export default async function ChartersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const [rows, stats] = await Promise.all([listCharters(supabase, { status: sp.status }), charterStats(supabase)]);
  const months = groupByMonth(rows);

  return (
    <AppShell active="charters" user={shellUser(profile)}>
      <PageHeader title="Charters" crumb="management / charters" actions={<Link href="/charters/new" className="btn primary">+ New charter</Link>} />
      <div className="kpi-row">
        <div className="kpi"><div className="l">Bookings</div><div className="v tnum">{stats.total}</div><div className="sub2">all statuses</div></div>
        <div className="kpi"><div className="l">Confirmed</div><div className="v tnum">{stats.confirmed}</div><div className="sub2">on the calendar</div></div>
        <div className="kpi"><div className="l">Upcoming</div><div className="v tnum">{stats.upcoming}</div><div className="sub2">future, booked</div></div>
        <div className="kpi"><div className="l">Gross fees</div><div className="v tnum">{money(stats.grossFees)}</div><div className="sub2">booked / optioned</div></div>
      </div>
      <Toolbar current={{ status: sp.status }} filters={[{ name: "status", label: "All statuses", options: CHARTER_STATUSES.map((s) => ({ value: s, label: label(s) })) }]} />

      {rows.length === 0 ? (
        <EmptyState title="No charters" message="Create a charter booking to plan the season." ctaLabel="+ New charter" ctaHref="/charters/new" />
      ) : (
        <div className="stack">
          {months.map((m) => (
            <div className="panel" key={m.key}>
              <div className="panel-h"><h4>{m.label}</h4><span className="sub">{m.items.length}</span></div>
              {m.items.map((c: any) => (
                <Link href={`/charters/${c.id}`} className="charter-row row-link" key={c.id}>
                  <span className="cr-yacht">{c.yacht?.name ?? "—"}<small>{c.destination ?? ""}{c.guests ? ` · ${c.guests} guests` : ""}</small></span>
                  <span className="cr-span">{span(c)}</span>
                  <span className="cr-client">{c.client?.name ?? "—"}</span>
                  <span className="cr-fee tnum">{c.gross_fee ? money(c.gross_fee) : "—"}</span>
                  <Pill tone={TONE[c.status] ?? "gray"}>{label(c.status)}</Pill>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
