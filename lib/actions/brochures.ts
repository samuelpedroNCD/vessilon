"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";

function newToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function generateBrochure(yachtId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const type = (fd.get("type")?.toString() || "sale") as string;
  const supabase = await createClient();
  const { error } = await supabase
    .from("brochures")
    .insert({
      org_id: profile.org_id,
      yacht_id: yachtId,
      type,
      status: "published",
      share_token: newToken(),
      generated_at: new Date().toISOString(),
      created_by: profile.id,
    } as never);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "create", entityType: "brochure", entityId: yachtId, summary: `Published ${type.replace(/_/g, " ")} brochure` });
  revalidatePath("/marketing");
}

export async function setBrochureStatus(id: string, status: "published" | "draft") {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("brochures").update({ status } as never).eq("id", id);
  await recordAudit({ action: "update", entityType: "brochure", entityId: id, summary: status === "draft" ? "Unpublished brochure" : "Re-published brochure" });
  revalidatePath("/marketing");
}

export async function deleteBrochure(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("brochures").delete().eq("id", id);
  await recordAudit({ action: "delete", entityType: "brochure", entityId: id, summary: "Deleted brochure" });
  revalidatePath("/marketing");
}
