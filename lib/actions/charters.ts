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
function fromForm(fd: FormData) {
  return {
    yacht_id: str(fd.get("yacht_id")),
    client_id: str(fd.get("client_id")),
    start_on: str(fd.get("start_on")),
    end_on: str(fd.get("end_on")),
    gross_fee: num(fd.get("gross_fee")),
    apa: num(fd.get("apa")),
    currency: str(fd.get("currency")) ?? "EUR",
    status: str(fd.get("status")) ?? "enquiry",
    destination: str(fd.get("destination")),
    guests: num(fd.get("guests")),
    notes: str(fd.get("notes")),
  };
}

export async function createCharter(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const payload = fromForm(fd);
  const supabase = await createClient();
  const { data, error } = await supabase.from("charters").insert({ ...payload, org_id: profile.org_id, broker: profile.id, created_by: profile.id } as never).select("id").single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "charter", entityId: newId, summary: "Created charter booking" });
  revalidatePath("/charters");
  redirect(`/charters/${newId}`);
}

export async function updateCharter(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("charters").update(fromForm(fd) as never).eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: "charter", entityId: id, summary: "Updated charter" });
  revalidatePath("/charters");
  revalidatePath(`/charters/${id}`);
  redirect(`/charters/${id}`);
}

export async function deleteCharter(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  await supabase.from("charters").delete().eq("id", id);
  await recordAudit({ action: "delete", entityType: "charter", entityId: id, summary: "Deleted charter" });
  revalidatePath("/charters");
  redirect("/charters");
}
