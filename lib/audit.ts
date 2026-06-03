import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";

export type AuditInput = {
  action: string; // create | update | delete | upload | remove | stage_move | role_change
  entityType: string; // yacht | lead | client | owner | opportunity | document | user | brochure
  entityId?: string | null;
  entityLabel?: string | null;
  summary?: string | null;
  meta?: Record<string, unknown>;
};

/**
 * Append an immutable entry to the org's audit trail. Best-effort: any failure
 * is swallowed so logging never blocks or breaks the underlying user action.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    const profile = await getProfile();
    if (!profile?.org_id) return;
    const supabase = await createClient();
    await supabase.from("audit_log").insert({
      org_id: profile.org_id,
      actor_id: profile.id,
      actor_name: profile.full_name,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      entity_label: input.entityLabel ?? null,
      summary: input.summary ?? null,
      meta: input.meta ?? {},
    } as never);
  } catch (e) {
    // best-effort: never block the user action, but surface in dev
    if (process.env.NODE_ENV !== "production") console.error("recordAudit failed:", e);
  }
}
