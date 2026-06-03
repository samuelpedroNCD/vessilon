import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { brokerOptions } from "@/lib/queries/fleet";
import { createLead } from "@/lib/actions/leads";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import LeadForm from "@/components/app/LeadForm";

export default async function NewLeadPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const brokers = await brokerOptions(supabase);
  return (
    <AppShell active="leads" user={shellUser(profile)}>
      <Link href="/leads" className="back">← Leads</Link>
      <PageHeader title="Add lead" crumb="leads / new" />
      <LeadForm action={createLead} brokers={brokers} submitLabel="Create lead" />
    </AppShell>
  );
}
