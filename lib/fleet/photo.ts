// Real yacht stock photos (Unsplash License — free for commercial use, no
// attribution required). Bundled under /public/yachts. A vessel is assigned a
// photo deterministically from its id so the same yacht always shows the same
// image, while the fleet shows visual variety.

const MOTOR = [
  "/yachts/motor-01.jpg",
  "/yachts/motor-02.jpg",
  "/yachts/motor-03.jpg",
  "/yachts/motor-04.jpg",
  "/yachts/motor-05.jpg",
];

const SAIL = [
  "/yachts/sail-01.jpg",
  "/yachts/sail-02.jpg",
  "/yachts/sail-03.jpg",
  "/yachts/sail-04.jpg",
];

/** Public URL for an object in the (public) yacht-images bucket. */
export function yachtImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/yacht-images/${path}`;
}

export function yachtPhoto(input: {
  id?: string | null;
  type?: string | null;
  hero_image?: string | null;
}): string {
  // An uploaded listing photo always wins over the stock fallback.
  if (input.hero_image) return yachtImageUrl(input.hero_image);

  const pool = input.type === "sail" ? SAIL : MOTOR;
  const key = input.id ?? "";
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return pool[h % pool.length];
}
