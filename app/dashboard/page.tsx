import { redirect } from "next/navigation";
import TideMark from "@/components/TideMark";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this route; this is defense-in-depth.
  if (!user) redirect("/login");

  const meta = user.user_metadata ?? {};
  const rows: [string, string | undefined][] = [
    ["Name", meta.full_name],
    ["Company", meta.company_name],
    ["Account type", meta.account_type],
    ["Fleet size", meta.fleet_size],
    ["Region", meta.region],
    ["Role", meta.role],
    ["Team size", meta.team_size],
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow: "0 24px 60px -28px rgba(0,0,0,0.18)",
          padding: "36px 38px",
          maxWidth: 460,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
          <TideMark variant="nav" size={26} />
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em" }}>Vessilon</span>
          <span
            className="mono"
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Signed in
          </span>
        </div>

        <h1 style={{ fontSize: 24, letterSpacing: "-0.025em", margin: "0 0 6px" }}>
          You&rsquo;re aboard.
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 22px", lineHeight: 1.5 }}>
          Signed in as <b>{user.email}</b>. This is a placeholder bridge — the full Broker Portal
          comes next.
        </p>

        <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "10px 14px",
                  fontSize: 13,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <span
                  className="mono"
                  style={{
                    color: "var(--ink-3)",
                    textTransform: "uppercase",
                    fontSize: 10,
                    letterSpacing: "0.06em",
                  }}
                >
                  {k}
                </span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
              </div>
            ))}
        </div>

        <form action={signOut} style={{ marginTop: 22 }}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              background: "var(--accent)",
              color: "var(--paper)",
              border: "none",
              borderRadius: 9,
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
