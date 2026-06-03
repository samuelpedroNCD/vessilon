"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";
import { REF } from "@/lib/dataroom/config";

function payloadFor(slug: string, fd: FormData): Record<string, unknown> {
  const e = REF[slug];
  const p: Record<string, unknown> = {};
  for (const f of e.fields) {
    const raw = (fd.get(f.key) ?? "").toString().trim();
    p[f.key] = f.kind === "number" ? (raw ? Number(raw) : null) : raw || null;
  }
  return p;
}

export async function createRef(slug: string, fd: FormData) {
  const e = REF[slug];
  const profile = await getProfile();
  if (!e || !profile?.org_id) redirect("/dashboard");
  const supabase = await createClient();
  const payload = payloadFor(slug, fd);
  const { data, error } = await supabase
    .from(e.table as never)
    .insert({ ...payload, org_id: profile.org_id, created_by: profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: slug, entityId: newId, entityLabel: (payload.name as string) ?? null, summary: `Added ${e.singular ?? slug}` });
  revalidatePath(`/dataroom/${slug}`);
  redirect(`/dataroom/${slug}/${newId}`);
}

export async function updateRef(slug: string, id: string, fd: FormData) {
  const e = REF[slug];
  const profile = await getProfile();
  if (!e || !profile?.org_id) redirect("/dashboard");
  const supabase = await createClient();
  const payload = payloadFor(slug, fd);
  const { error } = await supabase.from(e.table as never).update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: slug, entityId: id, entityLabel: (payload.name as string) ?? null, summary: `Updated ${e.singular}` });
  revalidatePath(`/dataroom/${slug}`);
  revalidatePath(`/dataroom/${slug}/${id}`);
  redirect(`/dataroom/${slug}/${id}`);
}

export async function deleteRef(slug: string, id: string) {
  const e = REF[slug];
  const profile = await getProfile();
  if (!e || !profile?.org_id) redirect("/dashboard");
  const supabase = await createClient();
  const { data: existing } = await supabase.from(e.table as never).select("name").eq("id", id).single();
  const { error } = await supabase.from(e.table as never).delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "delete", entityType: slug, entityId: id, entityLabel: (existing as { name?: string } | null)?.name ?? null, summary: `Deleted ${e.singular}` });
  revalidatePath(`/dataroom/${slug}`);
  redirect(`/dataroom/${slug}`);
}
