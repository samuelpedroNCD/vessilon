"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fffefb", color: "#15171a" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 460, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Vessilon</div>
            <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>Something went wrong</h1>
            <p style={{ color: "#5b6360", fontSize: 15, margin: "0 0 20px" }}>
              We hit an unexpected error. Please try again.
              {error.digest ? <><br /><span style={{ fontSize: 12, color: "#9aa19d" }}>Ref: {error.digest}</span></> : null}
            </p>
            <button
              onClick={reset}
              style={{ background: "#0f3b2e", color: "#fff", border: "none", borderRadius: 9, padding: "11px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
