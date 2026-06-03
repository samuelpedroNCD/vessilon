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

const RESPONDED = new Set(["accepted", "rejected", "countered", "withdrawn", "expired"]);

export async function setOfferStatus(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const status = str(fd.get("status"));
  if (!status) return;
  const supabase = await createClient();
  await supabase
    .from("offers")
    .update({ status, responded_at: RESPONDED.has(status) ? new Date().toISOString() : null } as never)
    .eq("id", id);
  await recordAudit({ action: "update", entityType: "offer", entityId: id, summary: `Offer marked ${status}` });
  revalidatePath("/offers");
}

export async function deleteOffer(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("offers").delete().eq("id", id);
  await recordAudit({ action: "delete", entityType: "offer", entityId: id, summary: "Deleted offer" });
  revalidatePath("/offers");
}

export async function createStandaloneOffer(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const opportunity_id = str(fd.get("opportunity_id"));
  if (!opportunity_id) redirect("/offers?error=deal");
  const supabase = await createClient();
  const { error } = await supabase.from("offers").insert({
    org_id: profile.org_id,
    opportunity_id,
    party: str(fd.get("party")),
    kind: str(fd.get("kind")) ?? "offer",
    amount: num(fd.get("amount")),
    currency: str(fd.get("currency")) ?? "USD",
    conditions: str(fd.get("conditions")),
    response_deadline: str(fd.get("response_deadline")),
    notes: str(fd.get("notes")),
    created_by: profile.id,
  } as never);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "create", entityType: "offer", entityId: opportunity_id, summary: "Logged offer" });
  revalidatePath("/offers");
  revalidatePath(`/pipeline/${opportunity_id}`);
  redirect("/offers");
}
