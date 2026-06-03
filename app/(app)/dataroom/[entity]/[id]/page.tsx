import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { REF } from "@/lib/dataroom/config";
import { getRef } from "@/lib/queries/reference";
import { deleteRef } from "@/lib/actions/reference";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";

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
        actions={<><Link href={`/dataroom/${e.slug}/${id}/edit`} className="btn outline sm">Edit</Link><form action={deleteRef.bind(null, entity, id)}><button className="btn outline sm" type="submit">Delete</button></form></>}
      />
      <div className="panel" style={{ maxWidth: 640 }}>
        <div className="spec-grid">
          {e.fields.filter((f) => f.key !== "name").map((f) => (
            <div className="sr" key={f.key}><span className="k">{f.label}</span><span className="v">{row[f.key] ?? "—"}</span></div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
