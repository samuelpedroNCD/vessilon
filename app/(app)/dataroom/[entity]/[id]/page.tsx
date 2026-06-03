import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { REF } from "@/lib/dataroom/config";
import { getRef } from "@/lib/queries/reference";
import { deleteRef } from "@/lib/actions/reference";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ConfirmForm from "@/components/app/ConfirmForm";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function RefDetailPage({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { entity, id } = await params;
  const e = REF[entity];
  if (!e) notFound();
  const supabase = await createClient();
  const row = (await getRef(supabase, e.table, id)) as any;
  if (!row) notFound();

  return (
    <AppShell active={entity} user={shellUser(profile)}>
      <Link href={`/dataroom/${e.slug}`} className="back">← {e.label}</Link>
      <PageHeader
        title={row.name}
        crumb={`dataroom / ${e.slug}`}
        actions={<><Link href={`/dataroom/${e.slug}/${id}/edit`} className="btn outline sm">Edit</Link><ConfirmForm action={deleteRef.bind(null, entity, id)} message={`Delete "${row.name}"? This can't be undone.`}><button className="btn outline sm" type="submit">Delete</button></ConfirmForm></>}
      />
      <div className="panel" style={{ maxWidth: 640 }}>
        <div className="spec-grid">
          {e.fields.filter((f) => f.key !== "name").map((f) => {
            const raw = row[f.key];
            const empty = raw == null || raw === "";
            const isUrl = f.key === "website" && !empty;
            return (
              <div className="sr" key={f.key}>
                <span className="k">{f.label}</span>
                <span className="v">
                  {empty ? <span style={{ color: "var(--ink-3)" }}>—</span>
                    : isUrl ? <a href={/^https?:\/\//i.test(String(raw)) ? String(raw) : `https://${raw}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{String(raw)}</a>
                    : String(raw)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
