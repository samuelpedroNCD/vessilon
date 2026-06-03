import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { createOwner } from "@/lib/actions/owners";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import OwnerForm from "@/components/app/OwnerForm";

export default async function NewOwnerPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return (
    <AppShell active="owners" user={shellUser(profile)}>
      <Link href="/owners" className="back">← Owners</Link>
      <PageHeader title="Add owner" crumb="owners / new" />
      <OwnerForm action={createOwner} submitLabel="Create owner" />
    </AppShell>
  );
}
