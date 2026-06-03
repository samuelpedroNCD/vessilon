import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listListings, listingStats } from "@/lib/queries/listings";
import { setListingStatus } from "@/lib/actions/listings";
import { yachtPhoto } from "@/lib/fleet/photo";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { Pill, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ListingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const [rows, stats, { data: org }] = await Promise.all([
    listListings(supabase),
    listingStats(supabase),
    supabase.from("organisations").select("slug").eq("id", profile.org_id).single(),
  ]);
  const slug = (org as { slug?: string } | null)?.slug;

  return (
    <AppShell active="listings" user={shellUser(profile)}>
      <PageHeader
        title="Listings"
        crumb="brokerage / listings"
        actions={slug ? <Link href={`/showcase/${slug}`} target="_blank" className="btn outline sm">View public catalogue ↗</Link> : undefined}
      />

      <div className="kpi-row">
        <div className="kpi"><div className="l">Listings</div><div className="v tnum">{stats.total}</div><div className="sub2">vessels in the fleet</div></div>
        <div className="kpi"><div className="l">Published</div><div className="v tnum">{stats.published}</div><div className="sub2">live in the catalogue</div></div>
        <div className="kpi"><div className="l">Featured</div><div className="v tnum">{stats.featured}</div><div className="sub2">highlighted</div></div>
        <div className="kpi"><div className="l">Unpublished</div><div className="v tnum">{stats.draft}</div><div className="sub2">draft / not listed</div></div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No vessels" message="Add yachts in Fleet, then publish them to your public catalogue here." ctaLabel="+ Add yacht" ctaHref="/fleet/new" />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Vessel</th><th>Headline</th><th className="num">Price</th><th>Listing</th><th>Publish</th><th className="chev" /></tr></thead>
            <tbody>
              {rows.map((y: any) => {
                const published = y.listing?.status === "published";
                return (
                  <tr key={y.id}>
                    <td><Link href={`/listings/${y.id}`} className="vc-cell row-link stretch"><span className="th vthumb pic" style={{ backgroundImage: `url(${yachtPhoto(y)})` }} /><span className="nm">{y.name}<small>{label(y.type)} · {label(y.lob)}</small></span></Link></td>
                    <td style={{ color: "var(--ink-2)" }}>{y.listing?.headline ?? <span style={{ color: "var(--ink-3)" }}>—</span>}</td>
                    <td className="tnum">{y.price ? money(y.price) : "—"}</td>
                    <td>{published ? <Pill tone="ok">Published</Pill> : <Pill tone="gray">Draft</Pill>}{y.listing?.featured ? <Pill tone="warn">Featured</Pill> : null}</td>
                    <td>
                      <form action={setListingStatus.bind(null, y.id, published ? "draft" : "published")}>
                        <button className="btn outline sm" type="submit">{published ? "Unpublish" : "Publish"}</button>
                      </form>
                    </td>
                    <td className="chev">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
