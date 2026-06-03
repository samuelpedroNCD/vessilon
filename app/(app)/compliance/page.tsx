import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { listVesselCerts, complianceStats, CERT_TYPES } from "@/lib/queries/compliance";
import { addVesselCert, deleteVesselCert } from "@/lib/actions/compliance";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import Toolbar from "@/components/app/Toolbar";
import EmptyState from "@/components/app/EmptyState";
import ExpiryBadge from "@/components/app/ExpiryBadge";
import { label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CompliancePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const [certs, stats, { data: yachts }] = await Promise.all([
    listVesselCerts(supabase, { yacht_id: sp.yacht, type: sp.type }),
    complianceStats(supabase),
    supabase.from("yachts").select("id, name").order("name"),
  ]);
  const ys = (yachts ?? []) as { id: string; name: string }[];
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  return (
    <AppShell active="compliance" user={shellUser(profile)}>
      <PageHeader title="Compliance" crumb="management / compliance" />

      <div className="kpi-row">
        <div className="kpi"><div className="l">Certificates</div><div className="v tnum">{stats.total}</div><div className="sub2">across {stats.vessels} vessels</div></div>
        <div className="kpi"><div className="l">Expired</div><div className="v tnum alert">{stats.expired}</div><div className="sub2">action required</div></div>
        <div className="kpi"><div className="l">Expiring soon</div><div className="v tnum">{stats.soon}</div><div className="sub2">within 90 days</div></div>
        <div className="kpi"><div className="l">Valid</div><div className="v tnum">{stats.ok}</div><div className="sub2">in date</div></div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-h"><h4>Record a certificate</h4></div>
        {ys.length === 0 ? <p className="doc-empty">Add a yacht first.</p> : (
          <form action={addVesselCert} className="form-grid">
            <div className="form-field"><label>Vessel *</label><select name="yacht_id" required defaultValue="">{[<option key="" value="" disabled>Select…</option>, ...ys.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)]}</select></div>
            <div className="form-field"><label>Type</label><select name="type" defaultValue="flag">{CERT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select></div>
            <div className="form-field"><label>Name *</label><input name="name" required placeholder="Certificate of Registry" /></div>
            <div className="form-field"><label>Issuer</label><input name="issuer" /></div>
            <div className="form-field"><label>Issued</label><input name="issued_on" type="date" /></div>
            <div className="form-field"><label>Expires</label><input name="expires_on" type="date" /></div>
            <div className="form-actions" style={{ gridColumn: "1 / -1" }}><button className="btn primary sm" type="submit">Add certificate</button></div>
          </form>
        )}
      </div>

      <Toolbar
        current={{ yacht: sp.yacht, type: sp.type }}
        filters={[
          { name: "yacht", label: "All vessels", options: ys.map((y) => ({ value: y.id, label: y.name })) },
          { name: "type", label: "All types", options: CERT_TYPES.map((t) => ({ value: t, label: label(t) })) },
        ]}
      />

      {certs.length === 0 ? (
        <EmptyState title="No certificates" message="Record flag, ISM/MLC, insurance, class and registry certificates to track expiry across the fleet." />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Vessel</th><th>Certificate</th><th>Type</th><th>Issuer</th><th className="num">Expires</th><th>Status</th><th className="chev" /></tr></thead>
            <tbody>
              {certs.map((c: any) => (
                <tr key={c.id}>
                  <td><Link href={`/fleet/${c.yacht?.id}`} className="row-link" style={{ color: "var(--accent)" }}>{c.yacht?.name ?? "—"}</Link></td>
                  <td>{c.name}{c.reference ? <small style={{ display: "block", color: "var(--ink-3)" }}>{c.reference}</small> : null}</td>
                  <td>{label(c.type)}</td>
                  <td>{c.issuer ?? "—"}</td>
                  <td className="tnum">{fmt(c.expires_on)}</td>
                  <td><ExpiryBadge expires={c.expires_on} /></td>
                  <td className="chev">
                    <form action={deleteVesselCert.bind(null, c.id, c.yacht?.id ?? "")}><button className="doc-del" type="submit" aria-label="Delete">✕</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
