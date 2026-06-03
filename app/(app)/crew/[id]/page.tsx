import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getCrew } from "@/lib/queries/crew";
import { deleteCrew, addCrewCert, deleteCrewCert, addCrewAssignment, deleteCrewAssignment } from "@/lib/actions/crew";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ConfirmForm from "@/components/app/ConfirmForm";
import ExpiryBadge from "@/components/app/ExpiryBadge";
import { Pill, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CrewDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const { crew: c, certs, assignments } = await getCrew(supabase, id);
  if (!c) notFound();
  const { data: yachts } = await supabase.from("yachts").select("id, name").order("name");
  const ys = (yachts ?? []) as { id: string; name: string }[];
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  return (
    <AppShell active="crew" user={shellUser(profile)}>
      <Link href="/crew" className="back">← Crew</Link>
      <PageHeader
        title={c.name}
        crumb="management / crew"
        sub={<><Pill tone={c.status === "onboard" ? "ok" : "gray"}>{label(c.status)}</Pill>{c.position && <span>{c.position}</span>}{c.nationality && <span>{c.nationality}</span>}{c.yacht?.name && <span>aboard {c.yacht.name}</span>}</>}
        actions={<><Link href={`/crew/${id}/edit`} className="btn outline sm">Edit</Link><ConfirmForm action={deleteCrew.bind(null, id)} message={`Delete ${c.name}?`}><button className="btn outline sm" type="submit">Delete</button></ConfirmForm></>}
      />
      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Certificates</h4><span className="sub">{certs.length}</span></div>
            {certs.map((cert: any) => (
              <div className="doc-row" key={cert.id} style={{ gap: 10 }}>
                <span style={{ flex: 1 }}>{cert.name}<small style={{ display: "block", color: "var(--ink-3)" }}>{[cert.number, cert.issuer].filter(Boolean).join(" · ")}{cert.expires_on ? ` · exp ${fmt(cert.expires_on)}` : ""}</small></span>
                <ExpiryBadge expires={cert.expires_on} />
                <form action={deleteCrewCert.bind(null, cert.id, id)}><button className="doc-del" type="submit" aria-label="Delete">✕</button></form>
              </div>
            ))}
            <form action={addCrewCert.bind(null, id)} className="doc-upload-row" style={{ marginTop: 10 }}>
              <input name="name" className="doc-inp" placeholder="STCW / ENG1 / CoC…" required />
              <input name="number" className="doc-inp" placeholder="No." style={{ maxWidth: 90 }} />
              <input name="expires_on" type="date" className="doc-sel" />
              <button className="btn outline sm" type="submit">Add</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Assignments</h4><span className="sub">{assignments.length}</span></div>
            {assignments.map((a: any) => (
              <div className="doc-row" key={a.id} style={{ gap: 10 }}>
                <span style={{ flex: 1 }}>{a.yacht?.name ?? "—"}<small style={{ display: "block", color: "var(--ink-3)" }}>{[a.role, `${fmt(a.start_on)} → ${a.end_on ? fmt(a.end_on) : "present"}`].filter(Boolean).join(" · ")}</small></span>
                <form action={deleteCrewAssignment.bind(null, a.id, id)}><button className="doc-del" type="submit" aria-label="Delete">✕</button></form>
              </div>
            ))}
            <form action={addCrewAssignment.bind(null, id)} className="doc-upload-row" style={{ marginTop: 10 }}>
              <select name="yacht_id" className="doc-sel"><option value="">— Vessel —</option>{ys.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select>
              <input name="role" className="doc-inp" placeholder="Role" style={{ maxWidth: 120 }} />
              <input name="start_on" type="date" className="doc-sel" />
              <button className="btn outline sm" type="submit">Add</button>
            </form>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Contact</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Email</span><span className="v">{c.email ?? "—"}</span></div>
              <div className="sr"><span className="k">Phone</span><span className="v">{c.phone ?? "—"}</span></div>
              <div className="sr"><span className="k">Day rate</span><span className="v">{c.day_rate ? `$${Number(c.day_rate).toLocaleString()}` : "—"}</span></div>
            </div>
            {c.notes && <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 12, lineHeight: 1.5 }}>{c.notes}</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
