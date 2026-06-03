import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /documents/:id/download — resolves the document (RLS-scoped to the
// caller's org), mints a short-lived signed URL for the private object, and
// redirects the browser to it. Optional ?dl=1 forces a download.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("name, storage_path")
    .eq("id", id)
    .single();

  const row = doc as { name: string; storage_path: string | null } | null;
  if (!row?.storage_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const wantsDownload = new URL(req.url).searchParams.get("dl") === "1";
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(row.storage_path, 60, wantsDownload ? { download: row.name } : undefined);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not sign URL" }, { status: 500 });
  }
  return NextResponse.redirect(data.signedUrl);
}
