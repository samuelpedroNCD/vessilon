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
function token() {
  return crypto.randomUUID().replace(/-/g, "");
}

/** Create or update a listing's marketing fields (upsert on yacht_id). */
export async function saveListing(yachtId: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const highlights = (fd.get("highlights")?.toString() ?? "")
    .split("\n").map((s) => s.trim()).filter(Boolean);
  const { error } = await supabase.from("listings").upsert({
    org_id: profile.org_id,
    yacht_id: yachtId,
    headline: str(fd.get("headline")),
    description: str(fd.get("description")),
    highlights,
    featured: fd.get("featured") === "on",
    created_by: profile.id,
  } as never, { onConflict: "yacht_id" });
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: "listing", entityId: yachtId, summary: "Saved listing" });
  revalidatePath("/listings");
  revalidatePath(`/listings/${yachtId}`);
}

export async function setListingStatus(yachtId: string, status: "published" | "draft") {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();
  // ensure a row + share token exist
  const { data: existing } = await supabase.from("listings").select("share_token").eq("yacht_id", yachtId).maybeSingle();
  const patch: Record<string, unknown> = { status, published_at: status === "published" ? new Date().toISOString() : null };
  if (status === "published" && !(existing as { share_token?: string } | null)?.share_token) patch.share_token = token();
  if (existing) {
    await supabase.from("listings").update(patch as never).eq("yacht_id", yachtId);
  } else {
    await supabase.from("listings").insert({ org_id: profile.org_id, yacht_id: yachtId, created_by: profile.id, ...patch } as never);
  }
  await recordAudit({ action: status === "published" ? "publish" : "update", entityType: "listing", entityId: yachtId, summary: status === "published" ? "Published listing" : "Unpublished listing" });
  revalidatePath("/listings");
  revalidatePath(`/listings/${yachtId}`);
}
