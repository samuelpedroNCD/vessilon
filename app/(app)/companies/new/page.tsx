import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { createCompany } from "@/lib/actions/companies";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import CompanyForm from "@/components/app/CompanyForm";

export default async function NewCompanyPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return (
    <AppShell active="companies" user={shellUser(profile)}>
      <Link href="/companies" className="back">← Companies</Link>
      <PageHeader title="Add company" crumb="companies / new" />
      <CompanyForm action={createCompany} submitLabel="Create company" />
    </AppShell>
  );
}
