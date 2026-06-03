import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listAudit, auditFacets, type AuditFilters } from "@/lib/queries/audit";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import { Pill, label, type Tone } from "@/components/app/Pill";

const ACTION_TONE: Record<string, Tone> = {
  create: "ok", convert: "ok", won: "ok",
  update: "info", upload: "info", stage_move: "warn", role_change: "warn",
  delete: "danger", remove: "danger", lost: "danger",
};

function timeAgo(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const filters: AuditFilters = { entity: sp.entity, action: sp.action, q: sp.q, period: sp.period };

  const supabase = await createClient();
  const [entries, facets] = await Promise.all([listAudit(supabase, filters), auditFacets(supabase)]);

  return (
    <AppShell active="audit" user={shellUser(profile)}>
      <PageHeader title="Audit log" crumb="system / audit" />

      <div className="kpi-row">
        <div className="kpi"><div className="l">Events</div><div className="v tnum">{entries.length}</div><div className="sub2">most recent first</div></div>
        <div className="kpi"><div className="l">Entity types</div><div className="v tnum">{facets.entities.length}</div><div className="sub2">tracked</div></div>
        <div className="kpi"><div className="l">Action types</div><div className="v tnum">{facets.actions.length}</div><div className="sub2">recorded</div></div>
        <div className="kpi"><div className="l">Retention</div><div className="v tnum">∞</div><div className="sub2">immutable trail</div></div>
      </div>

      <Toolbar
        current={filters as Record<string, string | undefined>}
        searchPlaceholder="Search actor, entity, summary…"
        filters={[
          { name: "entity", label: "All entities", options: facets.entities.map((e) => ({ value: e, label: label(e) })) },
          { name: "action", label: "All actions", options: facets.actions.map((a) => ({ value: a, label: label(a) })) },
          { name: "period", label: "Any time", options: [{ value: "1", label: "Last 24h" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }] },
        ]}
      />

      {entries.length === 0 ? (
        <EmptyState
          title="No activity yet"
          message="Create, update or move records and they'll appear here. Every write to the workspace is logged."
        />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="tnum" style={{ whiteSpace: "nowrap", color: "var(--ink-3)" }}>{timeAgo(e.created_at)}</td>
                  <td>{e.actor_name ?? "—"}</td>
                  <td><Pill tone={ACTION_TONE[e.action] ?? "gray"}>{label(e.action)}</Pill></td>
                  <td>
                    <span className="nm" style={{ display: "flex", flexDirection: "column" }}>
                      {e.entity_label ?? label(e.entity_type)}
                      {e.entity_label && <small style={{ color: "var(--ink-3)" }}>{label(e.entity_type)}</small>}
                    </span>
                  </td>
                  <td style={{ color: "var(--ink-2)" }}>{e.summary ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
