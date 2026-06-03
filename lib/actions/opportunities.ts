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

function oppFromForm(fd: FormData) {
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
  revalidatePath("/pipeline");
  redirect(`/pipeline/${(data as { id: string }).id}`);
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
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  redirect("/pipeline");
}

/** Move a deal to a stage; derive open/won/lost from the stage flags. */
export async function moveStage(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const stageId = str(fd.get("stage_id"));
  if (!stageId) redirect(`/pipeline/${id}`);
  const supabase = await createClient();
  const { data: stage } = await supabase.from("lob_stages").select("is_won, is_lost").eq("id", stageId).single();
  const s = stage as { is_won: boolean; is_lost: boolean } | null;
  const status = s?.is_won ? "won" : s?.is_lost ? "lost" : "open";
  const { error } = await supabase
    .from("opportunities")
    .update({ stage_id: stageId, status, won_at: status === "won" ? new Date().toISOString() : null } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
}
