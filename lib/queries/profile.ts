import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  org_id: string;
  role: string;
  full_name: string;
  email: string;
  initials: string;
  company: string;
  owner_id?: string | null;
  notifications_seen_at?: string | null;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const i = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (i || name.slice(0, 2)).toUpperCase();
}

/**
 * The signed-in user's profile (org + role + identity). Cached per request.
 * Returns null when not authenticated or not yet provisioned.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, org_id, role, full_name, email, avatar_initials, notifications_seen_at, org:organisations(name)")
    .eq("id", user.id)
    .single();

  const d = data as unknown as {
    id: string;
    org_id: string;
    role: string;
    full_name: string | null;
    email: string | null;
    avatar_initials: string | null;
    notifications_seen_at: string | null;
    org: { name: string } | null;
  } | null;

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const full_name = d?.full_name || meta.full_name || user.email?.split("@")[0] || "Broker";
  const company = d?.org?.name || meta.company_name || "Your workspace";

  if (!d) {
    // unprovisioned fallback (still lets the shell render)
    return {
      id: user.id,
      org_id: "",
      role: "admin",
      full_name,
      email: user.email ?? "",
      initials: initialsOf(full_name),
      company,
      notifications_seen_at: null,
    };
  }

  return {
    id: d.id,
    org_id: d.org_id,
    role: d.role,
    full_name,
    email: d.email || user.email || "",
    initials: d.avatar_initials || initialsOf(full_name),
    company,
    notifications_seen_at: d.notifications_seen_at,
  };
});

/** Shape the AppShell `user` prop from a profile. */
export function shellUser(p: Profile) {
  return { name: p.full_name, email: p.email, company: p.company, initials: p.initials };
}
