import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listMarketing, BROCHURE_TYPES } from "@/lib/queries/marketing";
import { generateBrochure, setBrochureStatus, deleteBrochure } from "@/lib/actions/brochures";
import { yachtPhoto } from "@/lib/fleet/photo";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import CopyLinkButton from "@/components/app/CopyLinkButton";
import { Pill, toneFor, label } from "@/components/app/Pill";

export default async function MarketingPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const yachts = await listMarketing(supabase, profile.org_id);

  const published = yachts.reduce((s, y) => s + y.brochures.filter((b) => b.status === "published").length, 0);
  const withPhoto = yachts.filter((y) => y.hero_image).length;
  const noCollateral = yachts.filter((y) => !y.brochures.some((b) => b.status === "published")).length;

  return (
    <AppShell active="marketing" user={shellUser(profile)}>
      <PageHeader title="Marketing room" crumb="brokerage / marketing" />

      {yachts.length === 0 ? (
        <EmptyState title="No listings yet" message="Add a yacht to start producing brochures and shareable listing pages." ctaLabel="+ Add yacht" ctaHref="/fleet/new" />
      ) : (
        <>
          <div className="kpi-row">
            <div className="kpi"><div className="l">Listings</div><div className="v tnum">{yachts.length}</div><div className="sub2">in the fleet</div></div>
            <div className="kpi"><div className="l">Published brochures</div><div className="v tnum">{published}</div><div className="sub2">live shareable pages</div></div>
            <div className="kpi"><div className="l">With photo</div><div className="v tnum">{withPhoto}</div><div className="sub2">of {yachts.length} listings</div></div>
            <div className="kpi"><div className="l">No collateral</div><div className="v tnum">{noCollateral}</div><div className="sub2">need a brochure</div></div>
          </div>

          <div className="panel" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr><th>Vessel</th><th>Status</th><th>Photo</th><th>Brochures</th><th>Publish</th></tr>
              </thead>
              <tbody>
                {yachts.map((y) => (
                  <tr key={y.id}>
                    <td>
                      <span className="vc-cell">
                        <span className="th vthumb pic" style={{ backgroundImage: `url(${yachtPhoto(y)})` }} />
                        <span className="nm">{y.name}<small>{label(y.type)} · {y.price ? money(y.price) : "—"}</small></span>
                      </span>
                    </td>
                    <td><Pill tone={toneFor(y.status)}>{label(y.status)}</Pill></td>
                    <td>{y.hero_image ? <Pill tone="ok">Yes</Pill> : <span style={{ color: "var(--ink-3)" }}>—</span>}</td>
                    <td>
                      {y.brochures.length ? (
                        <div className="mkt-chips">
                          {y.brochures.map((b) => (
                            <span className="mkt-chip" key={b.id}>
                              {b.status === "published" && b.share_token ? (
                                <>
                                  <a href={`/b/${b.share_token}`} target="_blank" rel="noreferrer">{label(b.type)} ↗</a>
                                  <CopyLinkButton path={`/b/${b.share_token}`} label="Copy" />
                                </>
                              ) : (
                                <span style={{ opacity: 0.6 }}>{label(b.type)} · draft</span>
                              )}
                              {b.status === "published" ? (
                                <form action={setBrochureStatus.bind(null, b.id, "draft")}><button title="Unpublish" type="submit">×</button></form>
                              ) : (
                                <form action={deleteBrochure.bind(null, b.id)}><button title="Delete" type="submit">×</button></form>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : <span style={{ color: "var(--ink-3)" }}>None</span>}
                    </td>
                    <td>
                      <form action={generateBrochure.bind(null, y.id)} className="mkt-gen">
                        <select name="type" defaultValue={y.lob === "charter" ? "charter" : "sale"} className="doc-sel">
                          {BROCHURE_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
                        </select>
                        <button className="btn primary sm" type="submit">Publish</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
