"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}

export async function addVesselCert(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const yacht_id = str(fd.get("yacht_id"));
  const name = str(fd.get("name"));
  if (!yacht_id || !name) return;
  const supabase = await createClient();
  await supabase.from("vessel_certificates").insert({
    org_id: profile.org_id, yacht_id, type: str(fd.get("type")) ?? "other", name,
    issuer: str(fd.get("issuer")), reference: str(fd.get("reference")),
    issued_on: str(fd.get("issued_on")), expires_on: str(fd.get("expires_on")),
  } as never);
  await recordAudit({ action: "create", entityType: "certificate", entityId: yacht_id, entityLabel: name, summary: `Added ${name}` });
  revalidatePath("/compliance");
  revalidatePath(`/fleet/${yacht_id}`);
}

export async function deleteVesselCert(id: string, yachtId: string) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  await supabase.from("vessel_certificates").delete().eq("id", id);
  revalidatePath("/compliance");
  revalidatePath(`/fleet/${yachtId}`);
}
