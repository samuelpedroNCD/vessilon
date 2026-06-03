import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, shellUser } from "@/lib/queries/profile";
import { brokerOptions } from "@/lib/queries/fleet";
import { createTask } from "@/lib/actions/tasks";
import AppShell from "@/components/app/AppShell";
import PageHeader from "@/components/app/PageHeader";

export default async function NewTaskPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const supabase = await createClient();
  const brokers = await brokerOptions(supabase);
  return (
    <AppShell active="tasks" user={shellUser(profile)}>
      <Link href="/tasks" className="back">← Tasks</Link>
      <PageHeader title="New task" crumb="tasks / new" />
      <form action={createTask} className="form-card">
        <input type="hidden" name="redirect_to" value="/tasks" />
        <div className="form-grid">
          <div className="form-field full"><label>Title *</label><input name="title" required placeholder="Call owner about price" /></div>
          <div className="form-field full"><label>Description</label><textarea name="description" /></div>
          <div className="form-field"><label>Due</label><input name="due_at" type="datetime-local" /></div>
          <div className="form-field"><label>Priority</label><select name="priority" defaultValue="medium"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
          <div className="form-field"><label>Assignee</label><select name="assignee" defaultValue=""><option value="">— Me —</option>{brokers.map((b) => <option key={b.id} value={b.id}>{b.full_name ?? "—"}</option>)}</select></div>
        </div>
        <div className="form-actions">
          <button className="btn primary" type="submit">Create task</button>
          <Link href="/tasks" className="btn outline">Cancel</Link>
        </div>
      </form>
    </AppShell>
  );
}
