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
function ownerFromForm(fd: FormData) {
  return {
    name: str(fd.get("name")) ?? "Unnamed owner",
    email: str(fd.get("email")),
    phone: str(fd.get("phone")),
    notes: str(fd.get("notes")),
  };
}

export async function createOwner(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const payload = ownerFromForm(fd);
  const { data, error } = await supabase
    .from("owners")
    .insert({ ...payload, org_id: profile.org_id, created_by: profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "owner", entityId: newId, entityLabel: payload.name, summary: `Added owner ${payload.name}` });
  revalidatePath("/owners");
  redirect(`/owners/${newId}`);
}

export async function updateOwner(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const payload = ownerFromForm(fd);
  const { error } = await supabase.from("owners").update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: "owner", entityId: id, entityLabel: payload.name, summary: `Updated owner ${payload.name}` });
  revalidatePath("/owners");
  revalidatePath(`/owners/${id}`);
  redirect(`/owners/${id}`);
}

export async function deleteOwner(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data: existing } = await supabase.from("owners").select("name").eq("id", id).single();
  const { error } = await supabase.from("owners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "delete", entityType: "owner", entityId: id, entityLabel: (existing as { name?: string } | null)?.name ?? null, summary: "Deleted owner" });
  revalidatePath("/owners");
  redirect("/owners");
}
