import Link from "next/link";

export default function AppNotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24, background: "#fffefb" }}>
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b8743a" }}>404</div>
        <h1 style={{ fontSize: 24, margin: "8px 0 6px", letterSpacing: "-0.01em" }}>We couldn&rsquo;t find that.</h1>
        <p style={{ color: "#5b6360", fontSize: 14, margin: "0 0 18px" }}>
          The record may have been moved or deleted, or the link is out of date.
        </p>
        <Link
          href="/dashboard"
          style={{ display: "inline-flex", background: "#0f3b2e", color: "#fff", borderRadius: 9, padding: "10px 18px", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
