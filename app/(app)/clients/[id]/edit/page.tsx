import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getClient } from "@/lib/queries/clients";
import { brokerOptions } from "@/lib/queries/fleet";
import { companyOptions } from "@/lib/queries/companies";
import { updateClientRecord } from "@/lib/actions/clients";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ClientForm from "@/components/app/ClientForm";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const [client, brokers, companies] = await Promise.all([getClient(supabase, id), brokerOptions(supabase), companyOptions(supabase)]);
  if (!client) notFound();
  return (
    <AppShell active="buyers" user={shellUser(profile)}>
      <Link href={`/clients/${id}`} className="back">← {(client as { name?: string }).name ?? "Client"}</Link>
      <PageHeader title="Edit client" crumb="clients / edit" />
      <ClientForm action={updateClientRecord.bind(null, id)} client={client} brokers={brokers} companies={companies} submitLabel="Save changes" />
    </AppShell>
  );
}
