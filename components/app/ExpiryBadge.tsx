import { certStatus } from "@/lib/certs";
import { Pill } from "@/components/app/Pill";

export default function ExpiryBadge({ expires }: { expires: string | null | undefined }) {
  const s = certStatus(expires);
  return <Pill tone={s.tone}>{s.label}</Pill>;
}
