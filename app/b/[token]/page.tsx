import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { yachtImageUrl } from "@/lib/fleet/photo";

export const dynamic = "force-dynamic";

function money(n: number | null, currency = "USD"): string {
  if (!n) return "Price on application";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `${sym}${n.toLocaleString()}`;
}
function cap(s?: string | null): string {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Bro = {
  name: string; builder: string | null; year: number | null; loa_m: number | null;
  price: number | null; currency: string | null; type: string | null; lob: string;
  region: string | null; status: string; hero_image: string | null;
  specs: Record<string, string> | null; org: string; brochure_type: string;
};

export default async function PublicBrochure({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_brochure", { p_token: token });
  if (!data) notFound();
  const y = data as Bro;
  const specs = y.specs ?? {};
  const hero = y.hero_image
    ? yachtImageUrl(y.hero_image)
    : (y.type === "sail" ? "/yachts/sail-01.jpg" : "/yachts/motor-01.jpg");

  const rows: [string, string][] = [
    ["Builder", y.builder ?? "—"],
    ["Year", y.year ? String(y.year) : "—"],
    ["Length overall", y.loa_m ? `${y.loa_m} m` : "—"],
    ["Beam", specs.beam ?? "—"],
    ["Guests", specs.guests ?? "—"],
    ["Cabins", specs.cabins ?? "—"],
    ["Cruising area", y.region ?? "—"],
    ["Flag", specs.flag ?? "—"],
  ];

  return (
    <main className="bro">
      <style>{`
        .bro { --teal:#0f3b2e; --signal:#b8743a; --paper:#fffefb; --ink:#15171a; --ink2:#5b6360; --line:#e7e4dc;
          background:var(--paper); color:var(--ink); min-height:100vh; }
        .bro * { box-sizing:border-box; }
        .bro .nav { display:flex; align-items:center; justify-content:space-between; padding:18px 28px; border-bottom:1px solid var(--line); }
        .bro .brand { font-weight:700; letter-spacing:-.01em; }
        .bro .tag { font-size:12px; color:var(--ink2); text-transform:uppercase; letter-spacing:.08em; }
        .bro .hero { position:relative; height:min(62vh,560px); background-size:cover; background-position:center; }
        .bro .hero::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.55)); }
        .bro .hero .cap { position:absolute; left:0; right:0; bottom:0; z-index:1; padding:32px 28px; color:#fff; }
        .bro .hero h1 { margin:0; font-size:clamp(28px,5vw,52px); letter-spacing:-.02em; }
        .bro .hero .sub { margin-top:8px; font-size:15px; opacity:.92; }
        .bro .wrap { max-width:960px; margin:0 auto; padding:36px 28px 64px; }
        .bro .price { font-size:26px; font-weight:600; color:var(--teal); }
        .bro .pill { display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:.06em; padding:4px 10px; border-radius:999px; background:#eef2ef; color:var(--teal); margin-left:10px; }
        .bro .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0 32px; margin-top:28px; }
        .bro .row { display:flex; justify-content:space-between; padding:13px 0; border-bottom:1px solid var(--line); font-size:14px; }
        .bro .row .k { color:var(--ink2); }
        .bro .row .v { font-weight:500; }
        .bro .cta { margin-top:34px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
        .bro .btn { background:var(--teal); color:#fff; padding:12px 20px; border-radius:9px; text-decoration:none; font-weight:600; font-size:14px; }
        .bro .btn.ghost { background:transparent; color:var(--teal); border:1px solid var(--line); }
        .bro .foot { border-top:1px solid var(--line); padding:22px 28px; color:var(--ink2); font-size:12px; text-align:center; }
        @media(max-width:640px){ .bro .grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="nav">
        <div className="brand">{y.org}</div>
        <div className="tag">{cap(y.brochure_type)} brochure</div>
      </div>

      <div className="hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="cap">
          <h1>{y.name}</h1>
          <div className="sub">{[y.builder, y.year, y.loa_m ? `${y.loa_m} m` : null].filter(Boolean).join(" · ")}</div>
        </div>
      </div>

      <div className="wrap">
        <div>
          <span className="price">{money(y.price, y.currency ?? "USD")}</span>
          <span className="pill">{cap(y.status)}</span>
          <span className="pill">{cap(y.lob)}</span>
        </div>

        <div className="grid">
          {rows.map(([k, v]) => (
            <div className="row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
          ))}
        </div>

        <div className="cta">
          <a className="btn" href={`mailto:?subject=Enquiry: ${encodeURIComponent(y.name)}`}>Enquire about this yacht</a>
          <span className="btn ghost">Request full specification</span>
        </div>
      </div>

      <div className="foot">Presented by {y.org} · Powered by Vessilon</div>
    </main>
  );
}
