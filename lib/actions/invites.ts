"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}
function token() {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function createInvite(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const role = str(fd.get("role")) ?? "broker";
  const email = str(fd.get("email"));
  const supabase = await createClient();
  const { error } = await supabase.from("invitations").insert({
    org_id: profile.org_id, email, role, token: token(), invited_by: profile.id,
  } as never);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "invite", entityType: "user", entityLabel: email, summary: `Invited ${email ?? "teammate"} as ${role}` });
  revalidatePath("/settings");
}

export async function revokeInvite(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("invitations").delete().eq("id", id);
  revalidatePath("/settings");
}
