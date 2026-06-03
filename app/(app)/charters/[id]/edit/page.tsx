import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getCharter } from "@/lib/queries/charters";
import { updateCharter } from "@/lib/actions/charters";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import CharterForm from "@/components/app/CharterForm";

export default async function EditCharterPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const charter = await getCharter(supabase, id);
  if (!charter) notFound();
  const [{ data: yachts }, { data: clients }] = await Promise.all([
    supabase.from("yachts").select("id, name").order("name"),
    supabase.from("clients").select("id, name").order("name"),
  ]);
  return (
    <AppShell active="charters" user={shellUser(profile)}>
      <Link href={`/charters/${id}`} className="back">← Charter</Link>
      <PageHeader title="Edit charter" crumb="charters / edit" />
      <CharterForm action={updateCharter.bind(null, id)} row={charter} yachts={(yachts ?? []) as any} clients={(clients ?? []) as any} submitLabel="Save changes" />
    </AppShell>
  );
}
