import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getListing } from "@/lib/queries/listings";
import { saveListing, setListingStatus } from "@/lib/actions/listings";
import { yachtPhoto } from "@/lib/fleet/photo";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import CopyLinkButton from "@/components/app/CopyLinkButton";
import { Pill, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ListingEditor({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const { yacht: y, listing: l } = await getListing(supabase, id);
  if (!y) notFound();
  const published = l?.status === "published";

  return (
    <AppShell active="listings" user={shellUser(profile)}>
      <Link href="/listings" className="back">← Listings</Link>
      <PageHeader
        title={y.name}
        crumb="brokerage / listings"
        sub={<><Pill tone={published ? "ok" : "gray"}>{published ? "Published" : "Draft"}</Pill><span>{label(y.type)} · {label(y.lob)}</span>{y.price ? <span>{money(y.price)}</span> : null}</>}
        actions={
          <>
            <form action={setListingStatus.bind(null, id, published ? "draft" : "published")}>
              <button className={`btn ${published ? "outline" : "primary"} sm`} type="submit">{published ? "Unpublish" : "Publish"}</button>
            </form>
            {published && l?.share_token ? <Link href={`/l/${l.share_token}`} target="_blank" className="btn outline sm">View ↗</Link> : null}
          </>
        }
      />

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Marketing copy</h4></div>
            <form action={saveListing.bind(null, id)} className="form-grid">
              <div className="form-field full"><label>Headline</label><input name="headline" defaultValue={l?.headline ?? ""} placeholder="A turn-key Mediterranean cruiser" /></div>
              <div className="form-field full"><label>Description</label><textarea name="description" defaultValue={l?.description ?? ""} rows={5} /></div>
              <div className="form-field full"><label>Highlights (one per line)</label><textarea name="highlights" defaultValue={(l?.highlights ?? []).join("\n")} rows={4} placeholder={"Recently refitted\nZero-speed stabilisers\nMCA compliant"} /></div>
              <div className="form-field"><label><input type="checkbox" name="featured" defaultChecked={!!l?.featured} /> Feature in catalogue</label></div>
              <div className="form-actions" style={{ gridColumn: "1 / -1" }}><button className="btn primary" type="submit">Save listing</button></div>
            </form>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Catalogue photo</h4></div>
            <div className="hero" style={{ marginBottom: 10 }}>
              <div className="photo vthumb pic" style={{ backgroundImage: `url(${yachtPhoto(y)})`, minHeight: 150 }} />
            </div>
            <p className="doc-empty">The listing photo is the yacht&rsquo;s hero image — change it on the <Link href={`/fleet/${id}`} style={{ color: "var(--accent)" }}>Fleet record</Link>.</p>
          </div>
          {published && l?.share_token && (
            <div className="panel">
              <div className="panel-h"><h4>Share</h4></div>
              <div className="doc-empty" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                Public link is live. <CopyLinkButton path={`/l/${l.share_token}`} label="Copy link" />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
