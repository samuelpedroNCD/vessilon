"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}
function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function leadFromForm(fd: FormData) {
  return {
    name: str(fd.get("name")),
    email: str(fd.get("email")),
    phone: str(fd.get("phone")),
    lob: str(fd.get("lob")),
    status: str(fd.get("status")) ?? "new",
    temperature: str(fd.get("temperature")),
    source: str(fd.get("source")),
    ai_confidence: num(fd.get("ai_confidence")),
    assigned_broker: str(fd.get("assigned_broker")),
    do_not_contact: fd.get("do_not_contact") === "on",
  };
}

export async function createLead(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const payload = leadFromForm(fd);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({ ...payload, org_id: profile.org_id, created_by: profile.id, assigned_broker: payload.assigned_broker ?? profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  redirect(`/leads/${(data as { id: string }).id}`);
}

export async function updateLead(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update(leadFromForm(fd) as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

export async function deleteLead(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  redirect("/leads");
}

/** Promote a lead to a Client, link it back, and mark the lead converted. */
export async function convertLead(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single();
  if (!lead) redirect("/leads");
  const l = lead as Record<string, unknown>;
  if (l.converted_client_id) redirect(`/clients/${l.converted_client_id}`);

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      org_id: profile.org_id,
      created_by: profile.id,
      name: l.name ?? "New client",
      email: l.email,
      phone: l.phone,
      categories: ["buyer"],
      temperature: l.temperature,
      source: l.source,
      preferences: l.preferences ?? {},
      assigned_broker: l.assigned_broker ?? profile.id,
    } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const clientId = (client as { id: string }).id;

  await supabase.from("leads").update({ status: "converted", converted_client_id: clientId } as never).eq("id", id);
  revalidatePath("/leads");
  revalidatePath("/clients");
  redirect(`/clients/${clientId}`);
}
