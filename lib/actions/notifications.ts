"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";

export async function markNotificationsSeen() {
  const profile = await getProfile();
  if (!profile?.id) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ notifications_seen_at: new Date().toISOString() } as never).eq("id", profile.id);
}
