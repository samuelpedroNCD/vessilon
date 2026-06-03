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
const rv = (id: string) => revalidatePath(`/closings/${id}`);

export async function updateClosing(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  await supabase
    .from("opportunities")
    .update({
      escrow_amount: num(fd.get("escrow_amount")),
      escrow_status: str(fd.get("escrow_status")),
      closing_date: str(fd.get("closing_date")),
    } as never)
    .eq("id", id);
  await recordAudit({ action: "update", entityType: "closing", entityId: id, summary: "Updated closing details" });
  revalidatePath("/closings");
  rv(id);
}

export async function addMilestone(oppId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const title = str(fd.get("title"));
  if (!title) return;
  const supabase = await createClient();
  const { count } = await supabase.from("closing_milestones").select("id", { count: "exact", head: true }).eq("opportunity_id", oppId);
  await supabase.from("closing_milestones").insert({
    org_id: profile.org_id, opportunity_id: oppId, title, due_on: str(fd.get("due_on")), position: count ?? 0,
  } as never);
  rv(oppId);
}

export async function toggleMilestone(id: string, oppId: string, done: boolean) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("closing_milestones").update({ done, done_at: done ? new Date().toISOString() : null } as never).eq("id", id);
  revalidatePath("/closings");
  rv(oppId);
}

export async function deleteMilestone(id: string, oppId: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("closing_milestones").delete().eq("id", id);
  rv(oppId);
}

export async function addParty(oppId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const name = str(fd.get("name"));
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("closing_parties").insert({
    org_id: profile.org_id, opportunity_id: oppId, role: str(fd.get("role")) ?? "other",
    name, email: str(fd.get("email")), phone: str(fd.get("phone")),
  } as never);
  rv(oppId);
}

export async function deleteParty(id: string, oppId: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("closing_parties").delete().eq("id", id);
  rv(oppId);
}

export async function addSplit(oppId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("commission_splits").insert({
    org_id: profile.org_id, opportunity_id: oppId,
    broker_id: str(fd.get("broker_id")), name: str(fd.get("name")),
    pct: num(fd.get("pct")), amount: num(fd.get("amount")),
  } as never);
  rv(oppId);
}

export async function deleteSplit(id: string, oppId: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("commission_splits").delete().eq("id", id);
  rv(oppId);
}
