/**
 * Vessilon "Tide" mark — the canonical brand symbol.
 * Three converging echoes meeting a captured reading at a split waterline,
 * with a depth probe. Geometry is copied verbatim from the design-system source
 * (ds/01-brand.html); only width/height scale. Use `variant` to pick the form.
 */
type Variant = "nav" | "nav-reversed" | "full" | "reversed" | "ink-apex" | "mono";

export default function TideMark({
  variant = "full",
  size = 56,
}: {
  variant?: Variant;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 56 56",
    fill: "none" as const,
  };

  if (variant === "nav") {
    // Simplified 2-echo lockup mark used in nav bars.
    return (
      <svg {...common}>
        <line x1="2" y1="42" x2="22" y2="42" stroke="#0f3b2e" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />
        <line x1="34" y1="42" x2="54" y2="42" stroke="#0f3b2e" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />
        <line x1="28" y1="42" x2="28" y2="51.5" stroke="#b8743a" strokeWidth="1.3" strokeDasharray="1.6 1.6" />
        <path d="M 25.5 51.5 L 28 54.5 L 30.5 51.5 Z" fill="#b8743a" />
        <path d="M 13 18 L 28 39 L 43 18" stroke="#0f3b2e" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <path d="M 6 10 L 28 42 L 50 10" stroke="#0f3b2e" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="42" r="3" fill="#b8743a" />
      </svg>
    );
  }

  if (variant === "nav-reversed") {
    // White-stroke nav mark for deep-teal backgrounds.
    return (
      <svg {...common}>
        <line x1="2" y1="42" x2="22" y2="42" stroke="#fffefb" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />
        <line x1="34" y1="42" x2="54" y2="42" stroke="#fffefb" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />
        <line x1="28" y1="42" x2="28" y2="51.5" stroke="#b8743a" strokeWidth="1.3" strokeDasharray="1.6 1.6" />
        <path d="M 25.5 51.5 L 28 54.5 L 30.5 51.5 Z" fill="#b8743a" />
        <path d="M 13 18 L 28 39 L 43 18" stroke="#fffefb" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <path d="M 6 10 L 28 42 L 50 10" stroke="#fffefb" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="42" r="3" fill="#b8743a" />
      </svg>
    );
  }

  if (variant === "reversed") {
    // White strokes, warm-signal apex — for deep-teal backgrounds.
    return (
      <svg {...common}>
        <line x1="2" y1="42" x2="22" y2="42" stroke="#fffefb" strokeWidth="1" opacity="0.62" strokeLinecap="round" />
        <line x1="34" y1="42" x2="54" y2="42" stroke="#fffefb" strokeWidth="1" opacity="0.62" strokeLinecap="round" />
        <line x1="6" y1="46" x2="20" y2="46" stroke="#fffefb" strokeWidth="0.5" opacity="0.32" strokeLinecap="round" />
        <line x1="36" y1="46" x2="50" y2="46" stroke="#fffefb" strokeWidth="0.5" opacity="0.32" strokeLinecap="round" />
        <line x1="28" y1="42" x2="28" y2="51.5" stroke="#b8743a" strokeWidth="0.9" strokeDasharray="1.3 1.3" />
        <line x1="26.2" y1="46.5" x2="29.8" y2="46.5" stroke="#b8743a" strokeWidth="0.7" opacity="0.8" strokeLinecap="round" />
        <line x1="26.2" y1="49" x2="29.8" y2="49" stroke="#b8743a" strokeWidth="0.7" opacity="0.8" strokeLinecap="round" />
        <path d="M 26 51.5 L 28 54.2 L 30 51.5 Z" fill="#b8743a" />
        <path d="M 13 18 L 28 39 L 43 18" stroke="#fffefb" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.62" />
        <path d="M 6 10 L 28 42 L 50 10" stroke="#fffefb" strokeWidth="2.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="42" r="5.6" fill="none" stroke="#b8743a" strokeWidth="0.9" opacity="0.75" />
        <circle cx="28" cy="42" r="2.6" fill="#b8743a" />
      </svg>
    );
  }

  // Default: full canonical mark on light surfaces.
  return (
    <svg {...common}>
      <line x1="2" y1="42" x2="22" y2="42" stroke="#0f3b2e" strokeWidth="1" opacity="0.55" strokeLinecap="round" />
      <line x1="34" y1="42" x2="54" y2="42" stroke="#0f3b2e" strokeWidth="1" opacity="0.55" strokeLinecap="round" />
      <line x1="6" y1="46" x2="20" y2="46" stroke="#0f3b2e" strokeWidth="0.5" opacity="0.24" strokeLinecap="round" />
      <line x1="36" y1="46" x2="50" y2="46" stroke="#0f3b2e" strokeWidth="0.5" opacity="0.24" strokeLinecap="round" />
      <line x1="28" y1="42" x2="28" y2="51.5" stroke="#b8743a" strokeWidth="0.9" strokeDasharray="1.3 1.3" />
      <line x1="26.2" y1="46.5" x2="29.8" y2="46.5" stroke="#b8743a" strokeWidth="0.7" opacity="0.7" strokeLinecap="round" />
      <line x1="26.2" y1="49" x2="29.8" y2="49" stroke="#b8743a" strokeWidth="0.7" opacity="0.7" strokeLinecap="round" />
      <path d="M 26 51.5 L 28 54.2 L 30 51.5 Z" fill="#b8743a" />
      <path d="M 19 25 L 28 36 L 37 25" stroke="#0f3b2e" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />
      <path d="M 13 18 L 28 39 L 43 18" stroke="#0f3b2e" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path d="M 6 10 L 28 42 L 50 10" stroke="#0f3b2e" strokeWidth="2.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="42" r="5.6" fill="none" stroke="#b8743a" strokeWidth="0.9" opacity="0.55" />
      <circle cx="28" cy="42" r="2.6" fill="#b8743a" />
    </svg>
  );
}
