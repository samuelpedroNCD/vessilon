import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { brokerOptions } from "@/lib/queries/fleet";
import { companyOptions } from "@/lib/queries/companies";
import { createClientRecord } from "@/lib/actions/clients";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ClientForm from "@/components/app/ClientForm";

export default async function NewClientPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const [brokers, companies] = await Promise.all([brokerOptions(supabase), companyOptions(supabase)]);
  return (
    <AppShell active="buyers" user={shellUser(profile)}>
      <Link href="/clients" className="back">← Clients</Link>
      <PageHeader title="Add client" crumb="clients / new" />
      <ClientForm action={createClientRecord} brokers={brokers} companies={companies} submitLabel="Create client" />
    </AppShell>
  );
}
