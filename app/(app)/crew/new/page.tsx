import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { createCrew } from "@/lib/actions/crew";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import CrewForm from "@/components/app/CrewForm";

export default async function NewCrewPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const { data: yachts } = await supabase.from("yachts").select("id, name").order("name");
  return (
    <AppShell active="crew" user={shellUser(profile)}>
      <Link href="/crew" className="back">← Crew</Link>
      <PageHeader title="Add crew" crumb="crew / new" />
      <CrewForm action={createCrew} yachts={(yachts ?? []) as { id: string; name: string }[]} submitLabel="Create crew" />
    </AppShell>
  );
}
