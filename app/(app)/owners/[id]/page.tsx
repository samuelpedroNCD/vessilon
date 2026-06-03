import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getOwner, getOwnerRelations } from "@/lib/queries/owners";
import { deleteOwner } from "@/lib/actions/owners";
import { money } from "@/lib/queries/overview";
import { yachtPhoto } from "@/lib/fleet/photo";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ConfirmForm from "@/components/app/ConfirmForm";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OwnerDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const o = (await getOwner(supabase, id)) as any;
  if (!o) notFound();
  const rel = await getOwnerRelations(supabase, id);

  return (
    <AppShell active="owners" user={shellUser(profile)}>
      <Link href="/owners" className="back">← Owners</Link>
      <PageHeader
        title={o.name}
        crumb="management / owners"
        actions={
          <>
            <Link href={`/owners/${id}/edit`} className="btn outline sm">Edit</Link>
            <ConfirmForm action={deleteOwner.bind(null, id)} message={`Delete owner "${o.name}"? This can't be undone.`}>
              <button className="btn outline sm" type="submit">Delete</button>
            </ConfirmForm>
          </>
        }
      />
      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Yachts</h4><span className="sub">{rel.yachts.length}</span></div>
            {rel.yachts.length ? (
              <div className="linked-records">
                {rel.yachts.map((y: any) => (
                  <Link href={`/fleet/${y.id}`} key={y.id} className="lr row-link">
                    <span className="ic vthumb pic" style={{ backgroundImage: `url(${yachtPhoto(y)})` }} />
                    <span className="nm">{y.name}<small>{y.hull_id ?? ""}</small></span>
                    <span className="end"><Pill tone={toneFor(y.status)}>{label(y.status)}</Pill> {y.price ? money(y.price) : ""}</span>
                  </Link>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No yachts linked to this owner.</p>}
          </div>
        </div>
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Contact</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Email</span><span className="v">{o.email ?? "—"}</span></div>
              <div className="sr"><span className="k">Phone</span><span className="v">{o.phone ?? "—"}</span></div>
            </div>
            {o.notes && <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 12, lineHeight: 1.5 }}>{o.notes}</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
