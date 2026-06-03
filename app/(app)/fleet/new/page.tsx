import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { brokerOptions, ownerOptions } from "@/lib/queries/fleet";
import { createYacht } from "@/lib/actions/yachts";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import YachtForm from "@/components/app/YachtForm";

export default async function NewYachtPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const [brokers, owners] = await Promise.all([brokerOptions(supabase), ownerOptions(supabase)]);

  return (
    <AppShell active="vessels" user={shellUser(profile)}>
      <Link href="/fleet" className="back">← Fleet</Link>
      <PageHeader title="Add yacht" crumb="fleet / new" />
      <YachtForm action={createYacht} brokers={brokers} owners={owners} submitLabel="Create yacht" />
    </AppShell>
  );
}
