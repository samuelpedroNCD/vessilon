"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}
function companyFromForm(fd: FormData) {
  return {
    name: str(fd.get("name")) ?? "Unnamed company",
    type: str(fd.get("type")) ?? "other",
    country: str(fd.get("country")),
    vat_id: str(fd.get("vat_id")),
    website: str(fd.get("website")),
  };
}

export async function createCompany(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({ ...companyFromForm(fd), org_id: profile.org_id, created_by: profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/companies");
  redirect(`/companies/${(data as { id: string }).id}`);
}

export async function updateCompany(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("companies").update(companyFromForm(fd) as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompany(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/companies");
  redirect("/companies");
}
