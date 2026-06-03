import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getYacht, brokerOptions, ownerOptions } from "@/lib/queries/fleet";
import { updateYacht } from "@/lib/actions/yachts";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import YachtForm from "@/components/app/YachtForm";

export default async function EditYachtPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const [yacht, brokers, owners] = await Promise.all([
    getYacht(supabase, id),
    brokerOptions(supabase),
    ownerOptions(supabase),
  ]);
  if (!yacht) notFound();

  return (
    <AppShell active="vessels" user={shellUser(profile)}>
      <Link href={`/fleet/${id}`} className="back">← {(yacht as { name: string }).name}</Link>
      <PageHeader title="Edit yacht" crumb="fleet / edit" />
      <YachtForm action={updateYacht.bind(null, id)} yacht={yacht} brokers={brokers} owners={owners} submitLabel="Save changes" />
    </AppShell>
  );
}
