// Shared interaction vocabulary used by the log form and the activity list.
export const INTERACTION_TYPES = [
  "call",
  "email",
  "meeting",
  "viewing",
  "brochure_share",
  "whatsapp",
  "note",
  "event",
  "other",
] as const;

export const INTERACTION_OUTCOMES = ["Positive", "Neutral", "Negative", "Follow-up Required"] as const;
