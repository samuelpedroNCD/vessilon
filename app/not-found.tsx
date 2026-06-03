import Link from "next/link";

export default function RootNotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#fffefb", color: "#15171a" }}>
      <div style={{ maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Vessilon</div>
        <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b8743a" }}>404</div>
        <h1 style={{ fontSize: 26, margin: "8px 0 8px", letterSpacing: "-0.02em" }}>Page not found</h1>
        <p style={{ color: "#5b6360", fontSize: 15, margin: "0 0 20px" }}>
          This page doesn&rsquo;t exist, or the brochure link has expired.
        </p>
        <Link
          href="/"
          style={{ display: "inline-flex", background: "#0f3b2e", color: "#fff", borderRadius: 9, padding: "11px 20px", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
        >
          Go to vessilon.com
        </Link>
      </div>
    </main>
  );
}
