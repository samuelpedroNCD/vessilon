import { logInteraction } from "@/lib/actions/interactions";
import { INTERACTION_TYPES as TYPES, INTERACTION_OUTCOMES as OUTCOMES } from "@/lib/interactions/constants";

function hum(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LogInteractionForm({
  clientId,
  leadId,
  yachtId,
  opportunityId,
}: {
  clientId?: string;
  leadId?: string;
  yachtId?: string;
  opportunityId?: string;
}) {
  return (
    <form action={logInteraction}>
      {clientId && <input type="hidden" name="client_id" value={clientId} />}
      {leadId && <input type="hidden" name="lead_id" value={leadId} />}
      {yachtId && <input type="hidden" name="yacht_id" value={yachtId} />}
      {opportunityId && <input type="hidden" name="opportunity_id" value={opportunityId} />}
      <div className="form-grid">
        <div className="form-field"><label>Type</label><select name="type">{TYPES.map((t) => <option key={t} value={t}>{hum(t)}</option>)}</select></div>
        <div className="form-field"><label>Outcome</label><select name="outcome"><option value="">—</option>{OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-field full"><label>Notes</label><textarea name="notes" placeholder="What happened?" /></div>
      </div>
      <div className="form-actions"><button className="btn primary sm" type="submit">Log interaction</button></div>
    </form>
  );
}
