import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { getNotifications } from "@/lib/queries/notifications";

export async function GET() {
  const profile = await getProfile();
  if (!profile?.org_id) return NextResponse.json({ items: [], unread: 0 }, { status: 401 });
  const supabase = await createClient();
  const data = await getNotifications(supabase, profile);
  return NextResponse.json(data);
}
