import Link from "next/link";

export default function EmptyState({
  title,
  message,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
