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
function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function crewFromForm(fd: FormData) {
  return {
    name: str(fd.get("name")) ?? "Unnamed",
    position: str(fd.get("position")),
    nationality: str(fd.get("nationality")),
    email: str(fd.get("email")),
    phone: str(fd.get("phone")),
    status: str(fd.get("status")) ?? "available",
    current_yacht_id: str(fd.get("current_yacht_id")),
    day_rate: num(fd.get("day_rate")),
    notes: str(fd.get("notes")),
  };
}

export async function createCrew(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const payload = crewFromForm(fd);
  const supabase = await createClient();
  const { data, error } = await supabase.from("crew").insert({ ...payload, org_id: profile.org_id, created_by: profile.id } as never).select("id").single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "crew", entityId: newId, entityLabel: payload.name, summary: `Added crew ${payload.name}` });
  revalidatePath("/crew");
  redirect(`/crew/${newId}`);
}

export async function updateCrew(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const payload = crewFromForm(fd);
  const supabase = await createClient();
  const { error } = await supabase.from("crew").update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: "crew", entityId: id, entityLabel: payload.name, summary: `Updated crew ${payload.name}` });
  revalidatePath("/crew");
  revalidatePath(`/crew/${id}`);
  redirect(`/crew/${id}`);
}

export async function deleteCrew(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data: ex } = await supabase.from("crew").select("name").eq("id", id).single();
  await supabase.from("crew").delete().eq("id", id);
  await recordAudit({ action: "delete", entityType: "crew", entityId: id, entityLabel: (ex as { name?: string } | null)?.name ?? null, summary: "Deleted crew" });
  revalidatePath("/crew");
  redirect("/crew");
}

export async function addCrewCert(crewId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const name = str(fd.get("name"));
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("crew_certificates").insert({
    org_id: profile.org_id, crew_id: crewId, name, number: str(fd.get("number")), issuer: str(fd.get("issuer")),
    issued_on: str(fd.get("issued_on")), expires_on: str(fd.get("expires_on")),
  } as never);
  revalidatePath(`/crew/${crewId}`);
}

export async function deleteCrewCert(id: string, crewId: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("crew_certificates").delete().eq("id", id);
  revalidatePath(`/crew/${crewId}`);
}

export async function addCrewAssignment(crewId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("crew_assignments").insert({
    org_id: profile.org_id, crew_id: crewId, yacht_id: str(fd.get("yacht_id")), role: str(fd.get("role")),
    start_on: str(fd.get("start_on")), end_on: str(fd.get("end_on")),
  } as never);
  revalidatePath(`/crew/${crewId}`);
}

export async function deleteCrewAssignment(id: string, crewId: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("crew_assignments").delete().eq("id", id);
  revalidatePath(`/crew/${crewId}`);
}
