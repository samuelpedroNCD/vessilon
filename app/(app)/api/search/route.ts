import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { globalSearch } from "@/lib/queries/global-search";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const supabase = await createClient();
  // RLS ties results to the caller's org; require auth.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ groups: [] }, { status: 401 });
  const groups = await globalSearch(supabase, q);
  return NextResponse.json({ groups });
}
