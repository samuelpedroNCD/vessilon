import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getCompany } from "@/lib/queries/companies";
import { updateCompany } from "@/lib/actions/companies";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import CompanyForm from "@/components/app/CompanyForm";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const company = await getCompany(supabase, id);
  if (!company) notFound();
  return (
    <AppShell active="companies" user={shellUser(profile)}>
      <Link href={`/companies/${id}`} className="back">← {(company as { name?: string }).name ?? "Company"}</Link>
      <PageHeader title="Edit company" crumb="companies / edit" />
      <CompanyForm action={updateCompany.bind(null, id)} company={company} submitLabel="Save changes" />
    </AppShell>
  );
}
