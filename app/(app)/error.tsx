"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // surface in the browser console / monitoring in dev
    console.error(error);
  }, [error]);

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b8743a" }}>
          Something went wrong
        </div>
        <h1 style={{ fontSize: 22, margin: "8px 0 6px", letterSpacing: "-0.01em" }}>
          This view hit a snag.
        </h1>
        <p style={{ color: "#5b6360", fontSize: 14, margin: 0 }}>
          The error has been logged. You can retry, or head back to your overview.
          {error.digest ? <><br /><span style={{ fontSize: 12, color: "#9aa19d" }}>Ref: {error.digest}</span></> : null}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={reset} style={btnPrimary}>Try again</button>
          <Link href="/dashboard" style={btnGhost}>Back to overview</Link>
        </div>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = { minHeight: "70vh", display: "grid", placeItems: "center", padding: 24, background: "#fffefb" };
const card: React.CSSProperties = { maxWidth: 460, width: "100%", border: "1px solid #e7e4dc", borderRadius: 14, padding: 28, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const btnPrimary: React.CSSProperties = { background: "#0f3b2e", color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer" };
const btnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", border: "1px solid #e7e4dc", borderRadius: 9, padding: "10px 16px", fontWeight: 500, fontSize: 14, color: "#15171a", textDecoration: "none" };
