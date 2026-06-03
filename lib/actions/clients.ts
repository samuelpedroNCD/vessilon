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

function clientFromForm(fd: FormData) {
  return {
    name: str(fd.get("name")) ?? "Unnamed client",
    email: str(fd.get("email")),
    phone: str(fd.get("phone")),
    categories: fd.getAll("categories").map(String),
    temperature: str(fd.get("temperature")),
    source: str(fd.get("source")),
    company_id: str(fd.get("company_id")),
    assigned_broker: str(fd.get("assigned_broker")),
    gdpr_consent: fd.get("gdpr_consent") === "on",
  };
}

export async function createClientRecord(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const p = clientFromForm(fd);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...p, org_id: profile.org_id, created_by: profile.id, assigned_broker: p.assigned_broker ?? profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "client", entityId: newId, entityLabel: p.name, summary: `New client ${p.name}` });
  revalidatePath("/clients");
  redirect(`/clients/${newId}`);
}

export async function updateClientRecord(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(clientFromForm(fd) as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientRecord(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data: existing } = await supabase.from("clients").select("name").eq("id", id).single();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "delete", entityType: "client", entityId: id, entityLabel: (existing as { name?: string } | null)?.name ?? null, summary: "Deleted client" });
  revalidatePath("/clients");
  redirect("/clients");
}
