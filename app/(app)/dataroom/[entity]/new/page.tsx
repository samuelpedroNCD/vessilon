import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { REF } from "@/lib/dataroom/config";
import { createRef } from "@/lib/actions/reference";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import RefForm from "@/components/app/RefForm";

export default async function NewRefPage({ params }: { params: Promise<{ entity: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { entity } = await params;
  const e = REF[entity];
  if (!e) notFound();
  return (
    <AppShell active={entity} user={shellUser(profile)}>
      <Link href={`/dataroom/${e.slug}`} className="back">← {e.label}</Link>
      <PageHeader title={`Add ${e.singular.toLowerCase()}`} crumb={`${e.slug} / new`} />
      <RefForm entity={e} action={createRef.bind(null, entity)} submitLabel={`Create ${e.singular.toLowerCase()}`} />
    </AppShell>
  );
}
