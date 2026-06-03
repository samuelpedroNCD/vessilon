import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { oppFormOptions, LOBS } from "@/lib/queries/pipeline";
import { brokerOptions } from "@/lib/queries/fleet";
import { createOpportunity } from "@/lib/actions/opportunities";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import OpportunityForm from "@/components/app/OpportunityForm";

export default async function NewDealPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const lob = LOBS.includes(sp.lob ?? "") ? sp.lob : "sale";
  const supabase = await createClient();
  const [{ clients, yachts }, brokers] = await Promise.all([oppFormOptions(supabase), brokerOptions(supabase)]);

  return (
    <AppShell active="pipeline" user={shellUser(profile)}>
      <Link href="/pipeline" className="back">← Pipeline</Link>
      <PageHeader title="New deal" crumb="pipeline / new" />
      <OpportunityForm action={createOpportunity} opp={{ lob }} clients={clients} yachts={yachts} brokers={brokers} submitLabel="Create deal" />
    </AppShell>
  );
}
