import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getCharter } from "@/lib/queries/charters";
import { deleteCharter } from "@/lib/actions/charters";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ConfirmForm from "@/components/app/ConfirmForm";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CharterDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const c = (await getCharter(supabase, id)) as any;
  if (!c) notFound();
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  return (
    <AppShell active="charters" user={shellUser(profile)}>
      <Link href="/charters" className="back">← Charters</Link>
      <PageHeader
        title={c.yacht?.name ? `${c.yacht.name} charter` : "Charter"}
        crumb="management / charters"
        sub={<><Pill tone={toneFor(c.status)}>{label(c.status)}</Pill>{c.destination && <span>{c.destination}</span>}{c.gross_fee ? <span>{money(c.gross_fee)} {c.currency}</span> : null}</>}
        actions={<><Link href={`/charters/${id}/edit`} className="btn outline sm">Edit</Link><ConfirmForm action={deleteCharter.bind(null, id)} message="Delete this charter?"><button className="btn outline sm" type="submit">Delete</button></ConfirmForm></>}
      />
      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Booking</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Yacht</span><span className="v">{c.yacht?.name ? <Link href={`/fleet/${c.yacht.id}`} style={{ color: "var(--accent)" }}>{c.yacht.name}</Link> : "—"}</span></div>
              <div className="sr"><span className="k">Client</span><span className="v">{c.client?.name ? <Link href={`/clients/${c.client.id}`} style={{ color: "var(--accent)" }}>{c.client.name}</Link> : "—"}</span></div>
              <div className="sr"><span className="k">Dates</span><span className="v">{fmt(c.start_on)} → {fmt(c.end_on)}</span></div>
              <div className="sr"><span className="k">Destination</span><span className="v">{c.destination ?? "—"}</span></div>
              <div className="sr"><span className="k">Guests</span><span className="v">{c.guests ?? "—"}</span></div>
              <div className="sr"><span className="k">Broker</span><span className="v">{c.broker_p?.full_name ?? "—"}</span></div>
            </div>
            {c.notes && <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 12, lineHeight: 1.5 }}>{c.notes}</p>}
          </div>
        </div>
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Commercials</h4></div>
            <div className="mini-kpis">
              <div className="mini-kpi"><div className="l">Gross fee</div><div className="v">{c.gross_fee ? money(c.gross_fee) : "—"}</div></div>
              <div className="mini-kpi"><div className="l">APA</div><div className="v">{c.apa ? money(c.apa) : "—"}</div></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
