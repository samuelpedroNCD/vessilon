"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";

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
  const payload = companyFromForm(fd);
  const { data, error } = await supabase
    .from("companies")
    .insert({ ...payload, org_id: profile.org_id, created_by: profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "company", entityId: newId, entityLabel: payload.name, summary: `Added company ${payload.name}` });
  revalidatePath("/companies");
  redirect(`/companies/${newId}`);
}

export async function updateCompany(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const payload = companyFromForm(fd);
  const { error } = await supabase.from("companies").update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: "company", entityId: id, entityLabel: payload.name, summary: `Updated company ${payload.name}` });
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompany(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data: existing } = await supabase.from("companies").select("name").eq("id", id).single();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "delete", entityType: "company", entityId: id, entityLabel: (existing as { name?: string } | null)?.name ?? null, summary: "Deleted company" });
  revalidatePath("/companies");
  redirect("/companies");
}
