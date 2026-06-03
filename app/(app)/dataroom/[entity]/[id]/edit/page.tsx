import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { REF } from "@/lib/dataroom/config";
import { getRef } from "@/lib/queries/reference";
import { updateRef } from "@/lib/actions/reference";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import RefForm from "@/components/app/RefForm";

export default async function EditRefPage({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { entity, id } = await params;
  const e = REF[entity];
  if (!e) notFound();
  const supabase = await createClient();
  const row = await getRef(supabase, e.table, id);
  if (!row) notFound();
  return (
    <AppShell active={entity} user={shellUser(profile)}>
      <Link href={`/dataroom/${e.slug}/${id}`} className="back">← {(row as { name?: string }).name ?? e.singular}</Link>
      <PageHeader title={`Edit ${e.singular.toLowerCase()}`} crumb={`${e.slug} / edit`} />
      <RefForm entity={e} action={updateRef.bind(null, entity, id)} row={row} submitLabel="Save changes" />
    </AppShell>
  );
}
