"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s || null;
}

export async function createTask(fd: FormData) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const due = str(fd.get("due_at"));
  const payload = {
    org_id: profile.org_id,
    created_by: profile.id,
    title: str(fd.get("title")) ?? "Untitled task",
    description: str(fd.get("description")),
    due_at: due ? new Date(due).toISOString() : null,
    priority: str(fd.get("priority")) ?? "medium",
    status: "todo",
    assignee: str(fd.get("assignee")) ?? profile.id,
    client_id: str(fd.get("client_id")),
    lead_id: str(fd.get("lead_id")),
    yacht_id: str(fd.get("yacht_id")),
    opportunity_id: str(fd.get("opportunity_id")),
  };
  const { error } = await supabase.from("tasks").insert(payload as never);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  const redirectTo = str(fd.get("redirect_to"));
  if (redirectTo) redirect(redirectTo);
}

export async function setTaskStatus(id: string, status: string) {
  const profile = await getProfile();
  if (!profile?.org_id) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}
