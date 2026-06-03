// Indicative gross commission rates by line of business. Used for the
// estimated-commission figures on the executive view and deal detail. These
// are display estimates only — no commission is stored on the deal.
export const COMMISSION_RATES: Record<string, number> = {
  sale: 0.09,
  charter: 0.15,
  new_build: 0.04,
  co_ownership: 0.06,
  trade: 0.05,
  services: 0.1,
};

export function commissionRate(lob: string | null | undefined): number {
  return (lob && COMMISSION_RATES[lob]) || 0.08;
}
