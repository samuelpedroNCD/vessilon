import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { yachtPhoto } from "@/lib/fleet/photo";
import { money } from "@/lib/queries/overview";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PortalPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "client") redirect("/dashboard");

  const supabase = await createClient();
  const ownerId = profile.owner_id;
  const [ownerRes, yachtsRes, reportsRes] = await Promise.all([
    ownerId ? supabase.from("owners").select("name").eq("id", ownerId).single() : Promise.resolve({ data: null }),
    ownerId ? supabase.from("yachts").select("id, name, type, status, price, hero_image, hero_color, builder, year, loa_m").eq("owner_id", ownerId).order("name") : Promise.resolve({ data: [] }),
    ownerId ? supabase.from("owner_reports").select("id, title, generated_at, share_token").eq("owner_id", ownerId).eq("status", "published").order("generated_at", { ascending: false }) : Promise.resolve({ data: [] }),
  ]);
  const ownerName = (ownerRes.data as any)?.name ?? profile.full_name;
  const yachts = (yachtsRes.data ?? []) as any[];
  const reports = (reportsRes.data ?? []) as any[];

  return (
    <main className="portal">
      <style>{`
        .portal { background:#fffefb; color:#15171a; min-height:100vh; font-family:system-ui,sans-serif; }
        .portal .nav { display:flex; align-items:center; justify-content:space-between; padding:18px 28px; border-bottom:1px solid #e7e4dc; }
        .portal .brand { font-weight:700; }
        .portal .nav a { color:#5b6360; text-decoration:none; font-size:13px; }
        .portal .wrap { max-width:1000px; margin:0 auto; padding:36px 24px 64px; }
        .portal h1 { font-size:clamp(24px,4vw,36px); letter-spacing:-.02em; margin:0 0 4px; }
        .portal .lede { color:#5b6360; margin:0 0 30px; }
        .portal h2 { font-size:14px; text-transform:uppercase; letter-spacing:.06em; color:#5b6360; margin:28px 0 12px; }
        .portal .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }
        .portal .card { border:1px solid #e7e4dc; border-radius:14px; overflow:hidden; background:#fff; }
        .portal .ph { height:150px; background:#0f3b2e center/cover no-repeat; }
        .portal .cbody { padding:14px 16px; }
        .portal .nm { font-weight:600; }
        .portal .sub { color:#5b6360; font-size:13px; margin-top:2px; }
        .portal .rep { display:flex; align-items:center; justify-content:space-between; border:1px solid #e7e4dc; border-radius:10px; padding:12px 16px; margin-bottom:8px; text-decoration:none; color:inherit; }
        .portal .rep:hover { background:#f6f4ef; }
        .portal .btn { background:#0f3b2e; color:#fff; padding:7px 14px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:600; }
        .portal .empty { color:#9aa19d; }
        .portal .foot { border-top:1px solid #e7e4dc; padding:22px 28px; color:#9aa19d; font-size:12px; text-align:center; }
      `}</style>
      <div className="nav"><div className="brand">{profile.company}</div><a href="/auth/signout">Sign out</a></div>
      <div className="wrap">
        <h1>Welcome, {ownerName}</h1>
        <p className="lede">Your fleet and reports, kept up to date by your brokerage.</p>

        <h2>Your vessels</h2>
        {yachts.length ? (
          <div className="grid">
            {yachts.map((y) => (
              <div className="card" key={y.id}>
                <div className="ph" style={{ backgroundImage: `url(${yachtPhoto(y)})` }} />
                <div className="cbody">
                  <div className="nm">{y.name}</div>
                  <div className="sub">{[y.builder, y.year, y.loa_m ? `${y.loa_m} m` : null].filter(Boolean).join(" · ")}</div>
                  <div className="sub" style={{ marginTop: 6 }}><Pill tone={toneFor(y.status)}>{label(y.status)}</Pill> {y.price ? money(y.price) : ""}</div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="empty">No vessels linked yet.</p>}

        <h2>Reports</h2>
        {reports.length ? (
          reports.map((r) => (
            <a className="rep" key={r.id} href={`/r/${r.share_token}`} target="_blank" rel="noreferrer">
              <span>{r.title}<small style={{ display: "block", color: "#9aa19d" }}>{r.generated_at ? new Date(r.generated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}</small></span>
              <span className="btn">View →</span>
            </a>
          ))
        ) : <p className="empty">No reports published yet.</p>}
      </div>
      <div className="foot">Owner portal · Powered by <Link href="/" style={{ color: "inherit" }}>Vessilon</Link></div>
    </main>
  );
}
