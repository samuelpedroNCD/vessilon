import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getYacht, getYachtRelations } from "@/lib/queries/fleet";
import { deleteYacht } from "@/lib/actions/yachts";
import { money } from "@/lib/queries/overview";
import AppShell from "@/components/app/AppShell";
import AgentCard from "@/components/app/AgentCard";
import { Pill, toneFor, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function YachtDetail({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const y = (await getYacht(supabase, id)) as any;
  if (!y) notFound();
  const rel = await getYachtRelations(supabase, id);
  const specs = (y.specs ?? {}) as Record<string, string>;
  const dom = Math.max(0, Math.round((Date.now() - new Date(y.created_at).getTime()) / 86400000));
  const spec = (k: string) => specs[k] ?? "—";

  return (
    <AppShell active="vessels" user={shellUser(profile)}>
      <Link href="/fleet" className="back">← Fleet</Link>

      <div className="hero">
        <div className={`photo vthumb ${y.hero_color ?? ""} ${y.type === "sail" ? "sail" : ""}`} />
        <div>
          <h1>{y.name}</h1>
          <div className="meta">
            {y.builder ?? ""}{y.year ? ` · ${y.year}` : ""}{y.hull_id ? ` · ${y.hull_id}` : ""}{" · "}
            <Pill tone={toneFor(y.status)}>{label(y.status)}</Pill>
          </div>
          <div className="hero-actions">
            <Link href={`/fleet/${id}/edit`} className="btn outline sm">Edit</Link>
            <span className="btn outline sm" style={{ opacity: 0.55 }}>Generate brochure</span>
            <form action={deleteYacht.bind(null, id)}>
              <button className="btn outline sm" type="submit">Delete</button>
            </form>
          </div>
          <div className="quickspecs">
            <div className="qs"><div className="l">LOA</div><div className="v">{y.loa_m ? `${y.loa_m} m` : "—"}</div></div>
            <div className="qs"><div className="l">Beam</div><div className="v">{spec("beam")}</div></div>
            <div className="qs"><div className="l">Gross tonnage</div><div className="v">{spec("gross_tonnage")}</div></div>
            <div className="qs"><div className="l">Guests</div><div className="v">{spec("guests")}</div></div>
            <div className="qs"><div className="l">Engines</div><div className="v">{spec("engines")}</div></div>
            <div className="qs"><div className="l">Cruise / max</div><div className="v">{specs.cruise && specs.max_speed ? `${specs.cruise}/${specs.max_speed} kn` : "—"}</div></div>
            <div className="qs"><div className="l">Flag</div><div className="v">{spec("flag")}</div></div>
            <div className="qs"><div className="l">Class</div><div className="v">{spec("class")}</div></div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Key particulars</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Builder</span><span className="v">{y.builder ?? "—"}</span></div>
              <div className="sr"><span className="k">Naval architect</span><span className="v">{spec("naval_architect")}</span></div>
              <div className="sr"><span className="k">Year / refit</span><span className="v">{y.year ?? "—"}{specs.refit_year ? ` / ${specs.refit_year}` : ""}</span></div>
              <div className="sr"><span className="k">Hull material</span><span className="v">{spec("hull_material")}</span></div>
              <div className="sr"><span className="k">Cabins</span><span className="v">{spec("cabins")}</span></div>
              <div className="sr"><span className="k">Range</span><span className="v">{spec("range")}</span></div>
              <div className="sr"><span className="k">Fuel</span><span className="v">{spec("fuel")}</span></div>
              <div className="sr"><span className="k">Tender</span><span className="v">{spec("tender")}</span></div>
              <div className="sr"><span className="k">IMO</span><span className="v">{y.imo ?? "—"}</span></div>
              <div className="sr"><span className="k">Region</span><span className="v">{y.region ?? "—"}</span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Recent activity</h4><span className="sub">{rel.interactions.length} logged</span></div>
            {rel.interactions.length ? (
              <div className="timeline">
                {rel.interactions.map((i: any, idx: number) => (
                  <div className="ev" key={i.id}>
                    <div className={`dot ${idx === 0 ? "now" : ""}`} />
                    <div><div className="t">{label(i.type)}</div><div className="d">{i.notes ?? ""}</div></div>
                    <div className="ts">{new Date(i.occurred_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No activity logged for this vessel yet.</p>}
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Opportunities</h4><span className="sub">{rel.opps.length}</span></div>
            {rel.opps.length ? (
              <div className="linked-records">
                {rel.opps.map((o: any) => (
                  <Link href={`/pipeline/${o.id}`} className="lr row-link" key={o.id}>
                    <span className="ic">OP</span>
                    <span className="nm">{o.title}<small>{o.stage?.name ?? ""}{o.client?.name ? ` · ${o.client.name}` : ""}</small></span>
                    <span className="end">{o.value ? money(o.value) : "—"}</span>
                  </Link>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No linked opportunities.</p>}
          </div>

          {(rel.documents.length > 0 || rel.tasks.length > 0) && (
            <div className="panel">
              <div className="panel-h"><h4>Documents &amp; tasks</h4></div>
              {rel.documents.map((d: any) => (
                <div className="doc-row" key={d.id}>📄 {d.name}<span className="end">{label(d.type)} · v{d.version}</span></div>
              ))}
              {rel.tasks.map((t: any) => (
                <div className="doc-row" key={t.id}>☑ {t.title}<span className="end">{label(t.status)}</span></div>
              ))}
              {rel.documents.length === 0 && rel.tasks.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--ink-3)" }}>None yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Financial snapshot</h4></div>
            <div className="mini-kpis">
              <div className="mini-kpi"><div className="l">Asking</div><div className="v">{y.price ? money(y.price) : "—"}</div></div>
              <div className="mini-kpi"><div className="l">Days on market</div><div className="v">{dom}d</div></div>
              <div className="mini-kpi"><div className="l">LOB</div><div className="v">{label(y.lob)}</div></div>
              <div className="mini-kpi"><div className="l">Status</div><div className="v">{label(y.status)}</div></div>
            </div>
          </div>

          <AgentCard
            title="Comps agent"
            body={<>I refreshed the comp set for <b>{y.name}</b>. The adjusted mean sits {y.price ? `near ${money(y.price)}` : "in range"} — want me to draft a price-position note for the owner?</>}
            primary="Review comps"
          />

          <div className="panel">
            <div className="panel-h"><h4>Linked records</h4></div>
            <div className="linked-records">
              <div className="lr"><span className="ic">OW</span><span className="nm">{y.owner?.name ?? "No owner linked"}<small>Owner</small></span></div>
              <div className="lr"><span className="ic">BR</span><span className="nm">{y.broker?.full_name ?? "Unassigned"}<small>Primary broker</small></span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h"><h4>Compliance &amp; position</h4></div>
            <div className="stub"><b>Not connected yet.</b> Flag-state docs, MLC / ISM expiry tracking and live AIS position arrive with the Fleet-ops module.</div>
          </div>
          <div className="panel">
            <div className="panel-h"><h4>Crew aboard</h4></div>
            <div className="stub"><b>Crew module coming soon.</b> SEAs, rotations and certificates will appear here.</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
