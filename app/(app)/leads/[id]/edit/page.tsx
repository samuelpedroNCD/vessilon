import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getLead } from "@/lib/queries/leads";
import { brokerOptions } from "@/lib/queries/fleet";
import { updateLead } from "@/lib/actions/leads";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import LeadForm from "@/components/app/LeadForm";

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const [lead, brokers] = await Promise.all([getLead(supabase, id), brokerOptions(supabase)]);
  if (!lead) notFound();
  return (
    <AppShell active="leads" user={shellUser(profile)}>
      <Link href={`/leads/${id}`} className="back">← {(lead as { name?: string }).name ?? "Lead"}</Link>
      <PageHeader title="Edit lead" crumb="leads / edit" />
      <LeadForm action={updateLead.bind(null, id)} lead={lead} brokers={brokers} submitLabel="Save changes" />
    </AppShell>
  );
}
