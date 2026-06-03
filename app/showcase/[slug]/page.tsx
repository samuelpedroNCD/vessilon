import { createClient } from "@/lib/supabase/server";
import { yachtImageUrl } from "@/lib/fleet/photo";

export const dynamic = "force-dynamic";

function money(n: number | null, currency = "USD"): string {
  if (!n) return "POA";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `${sym}${n.toLocaleString()}`;
}

type Card = { token: string; headline: string | null; featured: boolean; name: string; type: string | null; builder: string | null; year: number | null; loa_m: number | null; price: number | null; currency: string | null; hero_image: string | null };

export default async function Showcase({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_listings", { p_slug: slug });
  const listings = (data ?? []) as Card[];

  return (
    <main className="cat">
      <style>{`
        .cat { --teal:#0f3b2e; --paper:#fffefb; --ink:#15171a; --ink2:#5b6360; --line:#e7e4dc;
          background:var(--paper); color:var(--ink); min-height:100vh; font-family:system-ui,sans-serif; }
        .cat .nav { display:flex; align-items:center; justify-content:space-between; padding:18px 28px; border-bottom:1px solid var(--line); }
        .cat .brand { font-weight:700; }
        .cat .wrap { max-width:1100px; margin:0 auto; padding:36px 24px 64px; }
        .cat h1 { font-size:clamp(24px,4vw,40px); letter-spacing:-.02em; margin:0 0 6px; }
        .cat .lede { color:var(--ink2); margin:0 0 28px; }
        .cat .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        .cat .card { border:1px solid var(--line); border-radius:14px; overflow:hidden; text-decoration:none; color:inherit; background:#fff; transition:box-shadow .15s; }
        .cat .card:hover { box-shadow:0 6px 24px rgba(0,0,0,.10); }
        .cat .ph { height:180px; background:#0f3b2e center/cover no-repeat; position:relative; }
        .cat .feat { position:absolute; top:10px; left:10px; background:#b8743a; color:#fff; font-size:10px; text-transform:uppercase; letter-spacing:.06em; padding:3px 8px; border-radius:999px; }
        .cat .body { padding:14px 16px; }
        .cat .nm { font-weight:600; }
        .cat .sub { color:var(--ink2); font-size:13px; margin-top:2px; }
        .cat .pr { color:var(--teal); font-weight:600; margin-top:8px; }
        .cat .empty { color:var(--ink2); padding:40px 0; }
        .cat .foot { border-top:1px solid var(--line); padding:22px 28px; color:var(--ink2); font-size:12px; text-align:center; }
      `}</style>
      <div className="nav"><div className="brand">Vessilon</div><div className="sub" style={{ fontSize: 12, color: "#5b6360" }}>Yachts for sale &amp; charter</div></div>
      <div className="wrap">
        <h1>Featured fleet</h1>
        <p className="lede">A selection of vessels currently represented.</p>
        {listings.length === 0 ? (
          <div className="empty">No listings are published yet.</div>
        ) : (
          <div className="grid">
            {listings.map((c) => {
              const img = c.hero_image ? yachtImageUrl(c.hero_image) : (c.type === "sail" ? "/yachts/sail-01.jpg" : "/yachts/motor-01.jpg");
              return (
                <a className="card" key={c.token} href={`/l/${c.token}`}>
                  <div className="ph" style={{ backgroundImage: `url(${img})` }}>{c.featured && <span className="feat">Featured</span>}</div>
                  <div className="body">
                    <div className="nm">{c.name}</div>
                    <div className="sub">{[c.builder, c.year, c.loa_m ? `${c.loa_m} m` : null].filter(Boolean).join(" · ")}</div>
                    {c.headline && <div className="sub">{c.headline}</div>}
                    <div className="pr">{money(c.price, c.currency ?? "USD")}</div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
      <div className="foot">Powered by <a href="/" style={{ color: "inherit" }}>Vessilon</a></div>
    </main>
  );
}
