"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";
import { computeOwnerMetrics } from "@/lib/queries/owner-reports";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}
function token() {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function generateOwnerReport(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const owner_id = str(fd.get("owner_id"));
  if (!owner_id) redirect("/owner-reports?error=owner");
  const supabase = await createClient();
  const metrics = await computeOwnerMetrics(supabase, owner_id);
  const { data, error } = await supabase.from("owner_reports").insert({
    org_id: profile.org_id,
    owner_id,
    title: str(fd.get("title")) ?? "Owner report",
    period_start: str(fd.get("period_start")),
    period_end: str(fd.get("period_end")),
    metrics,
    narrative: str(fd.get("narrative")),
    generated_at: new Date().toISOString(),
    created_by: profile.id,
  } as never).select("id").single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "owner_report", entityId: newId, summary: "Generated owner report" });
  revalidatePath("/owner-reports");
  redirect(`/owner-reports/${newId}`);
}

export async function updateOwnerReportNarrative(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("owner_reports").update({ narrative: str(fd.get("narrative")), title: str(fd.get("title")) } as never).eq("id", id);
  revalidatePath(`/owner-reports/${id}`);
}

export async function setOwnerReportStatus(id: string, status: "published" | "draft") {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  const { data: ex } = await supabase.from("owner_reports").select("share_token").eq("id", id).single();
  const patch: Record<string, unknown> = { status };
  if (status === "published" && !(ex as { share_token?: string } | null)?.share_token) patch.share_token = token();
  await supabase.from("owner_reports").update(patch as never).eq("id", id);
  await recordAudit({ action: status === "published" ? "publish" : "update", entityType: "owner_report", entityId: id, summary: status === "published" ? "Published owner report" : "Unpublished owner report" });
  revalidatePath("/owner-reports");
  revalidatePath(`/owner-reports/${id}`);
}

export async function deleteOwnerReport(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  await supabase.from("owner_reports").delete().eq("id", id);
  await recordAudit({ action: "delete", entityType: "owner_report", entityId: id, summary: "Deleted owner report" });
  revalidatePath("/owner-reports");
  redirect("/owner-reports");
}
