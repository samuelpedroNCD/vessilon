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

export async function updateOrg(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase
    .from("organisations")
    .update({
      name: str(fd.get("name")) ?? "Workspace",
      region: str(fd.get("region")),
      account_type: str(fd.get("account_type")),
      fleet_size: str(fd.get("fleet_size")),
    } as never)
    .eq("id", profile.org_id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: "org", entityId: profile.org_id, summary: "Updated workspace settings" });
  revalidatePath("/settings");
  redirect("/settings?saved=org");
}

export async function setUserRole(userId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const role = str(fd.get("role"));
  if (!role) return;
  const supabase = await createClient();
  // RLS: only an admin may update other profiles in the org.
  const { data: target } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
  const { error } = await supabase.from("profiles").update({ role } as never).eq("id", userId);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "role_change", entityType: "user", entityId: userId, entityLabel: (target as { full_name?: string } | null)?.full_name ?? null, summary: `Role set to ${role}`, meta: { role } });
  revalidatePath("/settings");
  redirect("/settings?saved=role");
}
