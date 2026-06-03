import { ReactNode } from "react";

export type Tone = "ok" | "warn" | "danger" | "gray" | "info";

export function Pill({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

const TONE_MAP: Record<string, Tone> = {
  // yacht status
  active: "ok", under_offer: "warn", conditional: "warn", sold: "info", off_market: "gray",
  expired: "danger", draft: "gray", charter_only: "info", new_build: "info", co_ownership: "info",
  // lead status
  new: "gray", contacted: "info", qualified: "ok", converted: "ok", unqualified: "gray", lost: "danger",
  // temperature
  hot: "danger", warm: "warn", cold: "gray",
  // task status
  todo: "gray", in_progress: "info", waiting: "warn", completed: "ok", cancelled: "gray",
  // opp status
  open: "warn", won: "ok",
};

export function toneFor(s?: string | null): Tone {
  return (s && TONE_MAP[s]) || "gray";
}

/** Humanize an enum/snake_case value for display. */
export function label(s?: string | null): string {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
