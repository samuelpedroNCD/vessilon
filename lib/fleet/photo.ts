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

export function yachtPhoto(input: { id?: string | null; type?: string | null }): string {
  const pool = input.type === "sail" ? SAIL : MOTOR;
  const key = input.id ?? "";
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return pool[h % pool.length];
}
