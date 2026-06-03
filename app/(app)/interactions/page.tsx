import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listInteractions } from "@/lib/queries/interactions";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import LogInteractionForm from "@/components/app/LogInteractionForm";
import { label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TYPES = ["call", "email", "meeting", "viewing", "brochure_share", "whatsapp", "note", "event", "other"];

function linked(i: any): { href: string; name: string } | null {
  if (i.client) return { href: `/clients/${i.client.id}`, name: i.client.name };
  if (i.lead) return { href: `/leads/${i.lead.id}`, name: i.lead.name };
  if (i.yacht) return { href: `/fleet/${i.yacht.id}`, name: i.yacht.name };
  return null;
}

export default async function InteractionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const items = (await listInteractions(supabase, { type: sp.type })) as any[];

  return (
    <AppShell active="interactions" user={shellUser(profile)}>
      <PageHeader title="Activity" crumb="crm / interactions" />

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-h"><h4>Quick log</h4><span className="sub">unlinked note or touchpoint</span></div>
        <LogInteractionForm />
      </div>

      <Toolbar
        current={{ type: sp.type }}
        filters={[{ name: "type", label: "All types", options: TYPES.map((t) => ({ value: t, label: label(t) })) }]}
      />

      {items.length === 0 ? (
        <EmptyState title="No activity yet" message="Logged calls, emails, meetings and viewings will appear here." />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Type</th><th>Notes</th><th>Linked to</th><th>Broker</th><th>When</th></tr></thead>
            <tbody>
              {items.map((i) => {
                const ln = linked(i);
                return (
                  <tr key={i.id}>
                    <td>{label(i.type)}{i.outcome ? <span style={{ color: "var(--ink-3)" }}> · {i.outcome}</span> : ""}</td>
                    <td style={{ maxWidth: 360 }}>{i.notes ?? "—"}</td>
                    <td>{ln ? <Link href={ln.href} className="row-link" style={{ color: "var(--accent)" }}>{ln.name}</Link> : "—"}</td>
                    <td>{i.broker?.full_name ?? "—"}</td>
                    <td className="tnum">{new Date(i.occurred_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
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
