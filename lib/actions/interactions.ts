"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}

export async function logInteraction(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  const client_id = str(fd.get("client_id"));
  const lead_id = str(fd.get("lead_id"));
  const yacht_id = str(fd.get("yacht_id"));
  const opportunity_id = str(fd.get("opportunity_id"));
  const type = str(fd.get("type")) ?? "note";
  const notes = str(fd.get("notes"));
  const outcome = str(fd.get("outcome"));

  const { error } = await supabase.from("interactions").insert({
    org_id: profile.org_id,
    created_by: profile.id,
    broker_id: profile.id,
    type,
    notes,
    outcome,
    client_id,
    lead_id,
    yacht_id,
    opportunity_id,
  } as never);
  if (error) throw new Error(error.message);

  if (client_id) {
    await supabase.from("clients").update({ last_interaction_at: new Date().toISOString() } as never).eq("id", client_id);
    revalidatePath(`/clients/${client_id}`);
  }
  if (lead_id) revalidatePath(`/leads/${lead_id}`);
  if (yacht_id) revalidatePath(`/fleet/${yacht_id}`);
  revalidatePath("/interactions");
}
