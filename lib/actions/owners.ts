"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";

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
  const { data, error } = await supabase
    .from("owners")
    .insert({ ...ownerFromForm(fd), org_id: profile.org_id, created_by: profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/owners");
  redirect(`/owners/${(data as { id: string }).id}`);
}

export async function updateOwner(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("owners").update(ownerFromForm(fd) as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/owners");
  revalidatePath(`/owners/${id}`);
  redirect(`/owners/${id}`);
}

export async function deleteOwner(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("owners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/owners");
  redirect("/owners");
}
