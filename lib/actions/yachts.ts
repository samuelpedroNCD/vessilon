"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { recordAudit } from "@/lib/audit";

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}

const SPEC_KEYS = [
  "beam", "gross_tonnage", "guests", "cabins", "engines", "cruise", "max_speed",
  "range", "fuel", "naval_architect", "refit_year", "flag", "class", "hull_material", "tender",
];

function yachtFromForm(fd: FormData) {
  const specs: Record<string, string> = {};
  for (const k of SPEC_KEYS) {
    const v = str(fd.get(`spec_${k}`));
    if (v) specs[k] = v;
  }
  return {
    name: str(fd.get("name")),
    type: str(fd.get("type")),
    builder: str(fd.get("builder")),
    loa_m: num(fd.get("loa_m")),
    year: num(fd.get("year")),
    price: num(fd.get("price")),
    currency: str(fd.get("currency")) ?? "USD",
    lob: str(fd.get("lob")) ?? "sale",
    status: str(fd.get("status")) ?? "active",
    region: str(fd.get("region")),
    hull_id: str(fd.get("hull_id")),
    imo: str(fd.get("imo")),
    owner_id: str(fd.get("owner_id")),
    primary_broker: str(fd.get("primary_broker")),
    hero_color: str(fd.get("hero_color")) ?? "",
    specs,
  };
}

export async function createYacht(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const payload = yachtFromForm(fd);
  if (!payload.name) redirect("/fleet/new?error=name");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("yachts")
    .insert({ ...payload, org_id: profile.org_id, created_by: profile.id } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const newId = (data as { id: string }).id;
  await recordAudit({ action: "create", entityType: "yacht", entityId: newId, entityLabel: payload.name, summary: `Added yacht ${payload.name}` });
  revalidatePath("/fleet");
  redirect(`/fleet/${newId}`);
}

export async function updateYacht(id: string, fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const payload = yachtFromForm(fd);
  const { error } = await supabase.from("yachts").update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "update", entityType: "yacht", entityId: id, entityLabel: payload.name, summary: `Updated yacht ${payload.name}` });
  revalidatePath("/fleet");
  revalidatePath(`/fleet/${id}`);
  redirect(`/fleet/${id}`);
}

export async function deleteYacht(id: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { data: existing } = await supabase.from("yachts").select("name").eq("id", id).single();
  const label = (existing as { name?: string } | null)?.name ?? null;
  const { error } = await supabase.from("yachts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recordAudit({ action: "delete", entityType: "yacht", entityId: id, entityLabel: label, summary: `Deleted yacht ${label ?? id}` });
  revalidatePath("/fleet");
  redirect("/fleet");
}
