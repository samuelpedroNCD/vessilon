import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { getOrg, listUsers } from "@/lib/queries/settings";
import { listInvitations } from "@/lib/queries/invites";
import { updateOrg, setUserRole } from "@/lib/actions/settings";
import { createInvite, revokeInvite } from "@/lib/actions/invites";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";
import ConfirmForm from "@/components/app/ConfirmForm";
import CopyLinkButton from "@/components/app/CopyLinkButton";
import { Pill, label } from "@/components/app/Pill";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ROLES = ["admin", "executive", "senior_broker", "broker", "marketing", "operations", "client"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const supabase = await createClient();
  const [org, users, invites] = await Promise.all([getOrg(supabase), listUsers(supabase), listInvitations(supabase)]);
  const pendingInvites = (invites as any[]).filter((i) => i.status === "pending");
  const o = (org ?? {}) as any;
  const isAdmin = profile.role === "admin";
  const saved = sp.saved === "org" ? "Organisation settings saved." : sp.saved === "role" ? "Role updated." : null;
  const roleTone = (r: string) => (r === "admin" ? "warn" : r === "executive" || r === "senior_broker" ? "info" : "gray");

  return (
    <AppShell active="settings" user={shellUser(profile)}>
      <PageHeader title="Settings" crumb="settings / organisation" />
      {saved && <div className="savebar">✓ {saved}</div>}

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Organisation</h4>{!isAdmin && <span className="sub">read-only (admins can edit)</span>}</div>
            <form action={updateOrg} className="form-grid">
              <div className="form-field full"><label>Name</label><input name="name" defaultValue={o.name ?? ""} disabled={!isAdmin} /></div>
              <div className="form-field"><label>Account type</label><select name="account_type" defaultValue={o.account_type ?? ""} disabled={!isAdmin}><option value="">—</option><option value="brokerage">Brokerage</option><option value="management">Management</option><option value="both">Both</option></select></div>
              <div className="form-field"><label>Primary region</label><input name="region" defaultValue={o.region ?? ""} disabled={!isAdmin} /></div>
              <div className="form-field"><label>Fleet size</label><input name="fleet_size" defaultValue={o.fleet_size ?? ""} disabled={!isAdmin} /></div>
              {isAdmin && <div className="form-actions" style={{ gridColumn: "1 / -1" }}><button className="btn primary" type="submit">Save organisation</button></div>}
            </form>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><h4>Your profile</h4></div>
            <div className="spec-grid">
              <div className="sr"><span className="k">Name</span><span className="v">{profile.full_name}</span></div>
              <div className="sr"><span className="k">Email</span><span className="v">{profile.email}</span></div>
              <div className="sr"><span className="k">Role</span><span className="v">{label(profile.role)}</span></div>
              <div className="sr"><span className="k">Workspace</span><span className="v">{profile.company}</span></div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="panel-h"><h4>Invite teammates</h4><span className="sub">{pendingInvites.length} pending</span></div>
          <form action={createInvite} className="doc-upload-row" style={{ marginBottom: pendingInvites.length ? 14 : 0 }}>
            <input name="email" type="email" className="doc-inp" placeholder="teammate@brokerage.com" />
            <select name="role" className="doc-sel" defaultValue="broker">{ROLES.filter((r) => r !== "client").map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
            <button className="btn primary sm" type="submit">Create invite link</button>
          </form>
          {pendingInvites.map((i: any) => (
            <div className="doc-row" key={i.id} style={{ gap: 10 }}>
              <span style={{ flex: 1 }}>{i.email ?? "Anyone with the link"}<small style={{ display: "block", color: "var(--ink-3)" }}>{label(i.role)} · invited {new Date(i.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</small></span>
              <CopyLinkButton path={`/signup?invite=${i.token}`} label="Copy link" />
              <ConfirmForm action={revokeInvite.bind(null, i.id)} message="Revoke this invite?"><button className="doc-del" type="submit" aria-label="Revoke">✕</button></ConfirmForm>
            </div>
          ))}
          <p className="doc-empty" style={{ marginTop: 10 }}>Share the link with your teammate — they join this workspace with the chosen role when they sign up. (No email is sent.)</p>
        </div>
      )}

      <div className="panel" style={{ padding: 0, marginTop: 14 }}>
        <div className="panel-h" style={{ padding: "14px 20px" }}><h4>Users &amp; roles</h4><span className="sub">{users.length}</span></div>
        <table className="tbl">
          <thead><tr><th>User</th><th>Email</th><th>Role</th>{isAdmin && <th>Change role</th>}</tr></thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td><strong style={{ fontWeight: 600 }}>{u.full_name ?? "—"}</strong>{u.title ? <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{u.title}</div> : null}</td>
                <td>{u.email ?? "—"}</td>
                <td><Pill tone={roleTone(u.role)}>{label(u.role)}</Pill></td>
                {isAdmin && (
                  <td>
                    <ConfirmForm action={setUserRole.bind(null, u.id)} message={`Change ${u.full_name ?? "this user"}'s role?`} className="rolechg">
                      <select name="role" defaultValue={u.role} style={{ padding: "5px 8px", border: "1px solid var(--line-2)", borderRadius: 6, fontSize: 12 }}>
                        {ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}
                      </select>
                      <button className="btn outline sm" type="submit">Set</button>
                    </ConfirmForm>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
