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

function oppFromForm(fd: FormData) {
  const details: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("details_")) {
      const val = (v ?? "").toString().trim();
      if (val) details[k.slice("details_".length)] = val;
    }
  }
  return {
    title: str(fd.get("title")) ?? "Untitled deal",
    lob: str(fd.get("lob")) ?? "sale",
    client_id: str(fd.get("client_id")),
    yacht_id: str(fd.get("yacht_id")),
    stage_id: str(fd.get("stage_id")),
    value: num(fd.get("value")),
    currency: str(fd.get("currency")) ?? "USD",
    expected_close: str(fd.get("expected_close")),
    assigned_broker: str(fd.get("assigned_broker")),
    details,
  };
}

export async function createOpportunity(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const payload = oppFromForm(fd);

  // default to the first stage of the LOB if none chosen
  if (!payload.stage_id) {
    const { data: first } = await supabase.from("lob_stages").select("id").eq("lob", payload.lob as never).order("position").limit(1).single();
    payload.stage_id = (first as { id: string } | null)?.id ?? null;
  }

  const { data, error } = await supabase
    .from("opportunities")
    .insert({ ...payload, org_id: profile.org_id, created_by: profile.id, assigned_broker: payload.assigned_broker ?? profile.id, status: "open" } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "opportunity", entityId: newId, entityLabel: payload.title, summary: `New deal ${payload.title}`, meta: { lob: payload.lob } });
  revalidatePath("/pipeline");
  redirect(`/pipeline/${newId}`);
}

export async function updateOpportunity(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").update(oppFromForm(fd) as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
  redirect(`/pipeline/${id}`);
}

export async function deleteOpportunity(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data: existing } = await supabase.from("opportunities").select("title").eq("id", id).single();
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "delete", entityType: "opportunity", entityId: id, entityLabel: (existing as { title?: string } | null)?.title ?? null, summary: "Deleted deal" });
  revalidatePath("/pipeline");
  redirect("/pipeline");
}

/** Move a deal to a stage; derive open/won/lost from the stage flags, capture a
 *  reason on won/lost, stamp stage entry, and log a history event. */
export async function moveStage(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const stageId = str(fd.get("stage_id"));
  const reason = str(fd.get("reason"));
  if (!stageId) redirect(`/pipeline/${id}`);
  const supabase = await createClient();

  const { data: opp } = await supabase.from("opportunities").select("stage:lob_stages(name)").eq("id", id).single();
  const { data: stage } = await supabase.from("lob_stages").select("name, is_won, is_lost").eq("id", stageId).single();
  const fromName = (opp as { stage: { name: string } | null } | null)?.stage?.name ?? null;
  const s = stage as { name: string; is_won: boolean; is_lost: boolean } | null;
  const toName = s?.name ?? null;
  const status = s?.is_won ? "won" : s?.is_lost ? "lost" : "open";
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("opportunities")
    .update({
      stage_id: stageId,
      status,
      stage_entered_at: now,
      won_at: status === "won" ? now : null,
      close_reason: status === "won" || status === "lost" ? reason : null,
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("opportunity_events").insert({
    org_id: profile.org_id,
    opportunity_id: id,
    kind: status === "won" ? "won" : status === "lost" ? "lost" : "stage_change",
    from_stage: fromName,
    to_stage: toName,
    note: reason,
    actor: profile.id,
  } as never);

  await recordAudit({
    action: status === "won" ? "won" : status === "lost" ? "lost" : "stage_move",
    entityType: "opportunity",
    entityId: id,
    summary: `${fromName ?? "—"} → ${toName ?? "—"}`,
    meta: { from: fromName, to: toName, status, reason },
  });

  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
}

export async function addOffer(oppId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("offers").insert({
    org_id: profile.org_id,
    opportunity_id: oppId,
    party: str(fd.get("party")),
    kind: str(fd.get("kind")) ?? "offer",
    amount: num(fd.get("amount")),
    currency: str(fd.get("currency")) ?? "USD",
    conditions: str(fd.get("conditions")),
    response_deadline: str(fd.get("response_deadline")),
    created_by: profile.id,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${oppId}`);
}

export async function toggleChecklistItem(itemId: string, oppId: string, done: boolean) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  await supabase.from("checklist_items").update({ done, done_at: done ? new Date().toISOString() : null } as never).eq("id", itemId);
  revalidatePath(`/pipeline/${oppId}`);
}

const SALE_CLOSING_CHECKLIST = [
  "Signed MOA / purchase agreement",
  "Deposit received in escrow",
  "Survey & sea trial completed",
  "Bill of sale executed",
  "Registration / flag transfer",
  "Flag-state notification",
  "Finance clearance",
  "VAT / tax position confirmed",
  "Balance released from escrow",
  "Handover & inventory signed",
];

export async function seedClosingChecklist(oppId: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { count } = await supabase.from("checklist_items").select("id", { count: "exact", head: true }).eq("opportunity_id", oppId);
  if ((count ?? 0) > 0) {
    revalidatePath(`/pipeline/${oppId}`);
    return;
  }
  const rows = SALE_CLOSING_CHECKLIST.map((label, i) => ({
    org_id: profile.org_id,
    opportunity_id: oppId,
    label,
    position: i,
  }));
  await supabase.from("checklist_items").insert(rows as never);
  revalidatePath(`/pipeline/${oppId}`);
}
