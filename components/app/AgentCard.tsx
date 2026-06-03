import { ReactNode } from "react";

/** Representative "agent proposes" card — the brand throughline on detail
 *  pages. Not wired to a real agent backend yet. */
export default function AgentCard({
  title = "Vessilon agent",
  body,
  primary = "Review",
}: {
  title?: string;
  body: ReactNode;
  primary?: string;
}) {
  return (
    <div className="agent-card">
      <div className="ah"><span className="pulse" /> {title}</div>
      <div className="body">{body}</div>
      <div className="act">
        <button className="pri">{primary}</button>
        <button>Dismiss</button>
      </div>
    </div>
  );
}
