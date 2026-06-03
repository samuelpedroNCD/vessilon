import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getCrew } from "@/lib/queries/crew";
import { updateCrew } from "@/lib/actions/crew";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import CrewForm from "@/components/app/CrewForm";

export default async function EditCrewPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const { crew } = await getCrew(supabase, id);
  if (!crew) notFound();
  const { data: yachts } = await supabase.from("yachts").select("id, name").order("name");
  return (
    <AppShell active="crew" user={shellUser(profile)}>
      <Link href={`/crew/${id}`} className="back">← {crew.name}</Link>
      <PageHeader title={`Edit ${crew.name}`} crumb="crew / edit" />
      <CrewForm action={updateCrew.bind(null, id)} row={crew} yachts={(yachts ?? []) as { id: string; name: string }[]} submitLabel="Save changes" />
    </AppShell>
  );
}
