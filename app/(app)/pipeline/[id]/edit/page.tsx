import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getOpportunity, oppFormOptions, getStages } from "@/lib/queries/pipeline";
import { brokerOptions } from "@/lib/queries/fleet";
import { updateOpportunity } from "@/lib/actions/opportunities";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import OpportunityForm from "@/components/app/OpportunityForm";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const opp = (await getOpportunity(supabase, id)) as any;
  if (!opp) notFound();
  const [{ clients, yachts }, brokers, stages] = await Promise.all([
    oppFormOptions(supabase),
    brokerOptions(supabase),
    getStages(supabase, opp.lob),
  ]);

  return (
    <AppShell active="pipeline" user={shellUser(profile)}>
      <Link href={`/pipeline/${id}`} className="back">← {opp.title}</Link>
      <PageHeader title="Edit deal" crumb="pipeline / edit" />
      <OpportunityForm
        action={updateOpportunity.bind(null, id)}
        opp={opp}
        clients={clients}
        yachts={yachts}
        brokers={brokers}
        stages={stages as { id: string; name: string }[]}
        submitLabel="Save changes"
      />
    </AppShell>
  );
}
