import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { createCharter } from "@/lib/actions/charters";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import CharterForm from "@/components/app/CharterForm";

export default async function NewCharterPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const [{ data: yachts }, { data: clients }] = await Promise.all([
    supabase.from("yachts").select("id, name").order("name"),
    supabase.from("clients").select("id, name").order("name"),
  ]);
  return (
    <AppShell active="charters" user={shellUser(profile)}>
      <Link href="/charters" className="back">← Charters</Link>
      <PageHeader title="New charter" crumb="charters / new" />
      <CharterForm action={createCharter} yachts={(yachts ?? []) as any} clients={(clients ?? []) as any} submitLabel="Create charter" />
    </AppShell>
  );
}
