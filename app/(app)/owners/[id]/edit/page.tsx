import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getOwner } from "@/lib/queries/owners";
import { updateOwner } from "@/lib/actions/owners";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import OwnerForm from "@/components/app/OwnerForm";

export default async function EditOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const owner = await getOwner(supabase, id);
  if (!owner) notFound();
  return (
    <AppShell active="owners" user={shellUser(profile)}>
      <Link href={`/owners/${id}`} className="back">← {(owner as { name?: string }).name ?? "Owner"}</Link>
      <PageHeader title="Edit owner" crumb="owners / edit" />
      <OwnerForm action={updateOwner.bind(null, id)} owner={owner} submitLabel="Save changes" />
    </AppShell>
  );
}
