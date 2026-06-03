"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";

const BUCKET = "yacht-images";
const MAX = 10_485_760; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").slice(-80) || "photo";
}

export async function uploadYachtHero(
  ctx: { yachtId: string; revalidate: string },
  fd: FormData,
) {
  const profile = await getProfile();
  if (!profile?.org_id) return { ok: false, error: "Not signed in." };

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Use a JPEG, PNG, WebP or AVIF image." };
  }
  if (file.size > MAX) {
    return { ok: false, error: "Image exceeds the 10 MB limit." };
  }

  const supabase = await createClient();
  const path = `${profile.org_id}/${ctx.yachtId}/${crypto.randomUUID()}-${safeName(file.name)}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return { ok: false, error: `Upload failed: ${upErr.message}` };

  // Read the previous image so we can clean it up after a successful swap.
  const { data: prev } = await supabase
    .from("yachts")
    .select("hero_image")
    .eq("id", ctx.yachtId)
    .single();
  const oldPath = (prev as { hero_image: string | null } | null)?.hero_image ?? null;

  const { error: updErr } = await supabase
    .from("yachts")
    .update({ hero_image: path } as never)
    .eq("id", ctx.yachtId);

  if (updErr) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, error: `Could not save photo: ${updErr.message}` };
  }

  if (oldPath && oldPath !== path) {
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }

  await recordAudit({ action: "upload", entityType: "yacht", entityId: ctx.yachtId, summary: "Updated listing photo" });
  revalidatePath(ctx.revalidate);
  revalidatePath("/fleet");
  return { ok: true };
}

export async function removeYachtHero(ctx: { yachtId: string; revalidate: string }) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();

  const { data: prev } = await supabase
    .from("yachts")
    .select("hero_image")
    .eq("id", ctx.yachtId)
    .single();
  const oldPath = (prev as { hero_image: string | null } | null)?.hero_image ?? null;

  await supabase.from("yachts").update({ hero_image: null } as never).eq("id", ctx.yachtId);
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);

  revalidatePath(ctx.revalidate);
  revalidatePath("/fleet");
}
