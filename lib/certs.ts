import type { Tone } from "@/components/app/Pill";

export type CertBucket = "expired" | "soon" | "ok" | "none";

/** Classify a certificate/expiry date into a status bucket + display. */
export function certStatus(expires_on: string | null | undefined): { bucket: CertBucket; tone: Tone; label: string } {
  if (!expires_on) return { bucket: "none", tone: "gray", label: "No expiry" };
  const days = Math.floor((new Date(expires_on).getTime() - Date.now()) / 86400000);
  if (days < 0) return { bucket: "expired", tone: "danger", label: `Expired ${-days}d ago` };
  if (days <= 30) return { bucket: "soon", tone: "danger", label: `${days}d left` };
  if (days <= 90) return { bucket: "soon", tone: "warn", label: `${days}d left` };
  return { bucket: "ok", tone: "ok", label: `Valid · ${new Date(expires_on).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` };
}
