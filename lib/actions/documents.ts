"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";
import type { EntityKind } from "@/lib/queries/documents";

const COLUMN: Record<EntityKind, string> = {
  yacht: "yacht_id",
  client: "client_id",
  owner: "owner_id",
  opportunity: "opportunity_id",
};

const BUCKET = "documents";

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").slice(-80) || "file";
}

export type UploadCtx = { entity: EntityKind; entityId: string; revalidate: string };

export async function uploadDocument(ctx: UploadCtx, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) return { ok: false, error: "Not signed in." };

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (file.size > 52_428_800) {
    return { ok: false, error: "File exceeds the 50 MB limit." };
  }

  const supabase = await createClient();
  const cleaned = safeName(file.name);
  const displayName = (fd.get("name")?.toString().trim() || file.name).slice(0, 160);
  const type = (fd.get("type")?.toString() || "other") as string;
  const path = `${profile.org_id}/${ctx.entity}/${crypto.randomUUID()}-${cleaned}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) return { ok: false, error: `Upload failed: ${upErr.message}` };

  const { error: insErr } = await supabase.from("documents").insert({
    org_id: profile.org_id,
    name: displayName,
    type,
    storage_path: path,
    [COLUMN[ctx.entity]]: ctx.entityId,
    created_by: profile.id,
  } as never);

  if (insErr) {
    // roll back the orphaned object so storage and the table stay consistent
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, error: `Could not save document: ${insErr.message}` };
  }

  await recordAudit({ action: "upload", entityType: "document", entityLabel: displayName, summary: `Uploaded ${type} to ${ctx.entity}`, meta: { entity: ctx.entity, entity_id: ctx.entityId } });
  revalidatePath(ctx.revalidate);
  return { ok: true };
}

export async function deleteDocument(
  ctx: { id: string; storage_path: string | null; revalidate: string },
) {
  const profile = await getProfile();
  if (!profile?.org_id) return;
  const supabase = await createClient();

  if (ctx.storage_path) {
    await supabase.storage.from(BUCKET).remove([ctx.storage_path]);
  }
  await supabase.from("documents").delete().eq("id", ctx.id);
  await recordAudit({ action: "delete", entityType: "document", entityId: ctx.id, summary: "Removed document" });
  revalidatePath(ctx.revalidate);
}
