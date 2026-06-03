"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
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
  const { data, error } = await supabase
    .from(e.table as never)
    .insert({ ...payloadFor(slug, fd), org_id: profile.org_id, created_by: profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/dataroom/${slug}`);
  redirect(`/dataroom/${slug}/${(data as { id: string }).id}`);
}

export async function updateRef(slug: string, id: string, fd: FormData) {
  const e = REF[slug];
  const profile = await getProfile();
  if (!e || !profile?.org_id) redirect("/dashboard");
  const supabase = await createClient();
  const { error } = await supabase.from(e.table as never).update(payloadFor(slug, fd) as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dataroom/${slug}`);
  revalidatePath(`/dataroom/${slug}/${id}`);
  redirect(`/dataroom/${slug}/${id}`);
}

export async function deleteRef(slug: string, id: string) {
  const e = REF[slug];
  const profile = await getProfile();
  if (!e || !profile?.org_id) redirect("/dashboard");
  const supabase = await createClient();
  const { error } = await supabase.from(e.table as never).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dataroom/${slug}`);
  redirect(`/dataroom/${slug}`);
}
