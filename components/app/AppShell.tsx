import { ReactNode } from "react";
import TideMark from "@/components/TideMark";
import UserMenu from "./UserMenu";

type IconKey =
  | "overview" | "inbox" | "tasks" | "pipeline" | "listings" | "buyers"
  | "offers" | "closings" | "vessels" | "crew" | "charters" | "compliance"
  | "reports" | "agents" | "audit";

const ICONS: Record<IconKey, ReactNode> = {
  overview: (<><rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="7.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="1.5" y="7.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="7.5" y="7.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /></>),
  inbox: (<path d="M2 4l5-3 5 3v6l-5 3-5-3V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />),
  tasks: (<><rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M4 6l1.5 1.5L8 5M4 10l1.5 1.5L8 9" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></>),
  pipeline: (<><path d="M2 2v10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M4 8l3-3 2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></>),
  listings: (<><rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M2 6h10M5 3V1.5M9 3V1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
  buyers: (<><circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 12c.5-2 2-3 3.5-3s3 1 3.5 3M9.5 8c1.5 0 2.5 1 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
  offers: (<><path d="M2 5l5-3 5 3v6l-5 3-5-3V5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="7" cy="8" r="1.5" fill="currentColor" /></>),
  closings: (<path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />),
  vessels: (<path d="M2 8l5-5 5 5v3H2V8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />),
  crew: (<><circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" /><circle cx="10" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1 11c.4-1.6 1.8-2.5 4-2.5s3.6.9 4 2.5M9 11c.4-1.2 1.4-2 3-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
  charters: (<><rect x="1.5" y="3" width="11" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.3" /></>),
  compliance: (<><rect x="3" y="1.5" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M5 4.5h4M5 7h4M5 9.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
  reports: (<><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" /><circle cx="7" cy="7" r="2" fill="currentColor" /></>),
  agents: (<><path d="M7 1l5 3v6l-5 3-5-3V4l5-3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="7" cy="7" r="1.5" fill="currentColor" /></>),
  audit: (<><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" /><path d="M7 2.5v4.5l3 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
};

type NavEntry =
  | { type: "group"; label: string }
  | { type: "item"; key: IconKey; label: string; href: string; ct?: string; alert?: boolean };

const NAV: NavEntry[] = [
  { type: "item", key: "overview", label: "Overview", href: "/dashboard" },
  { type: "item", key: "inbox", label: "Inbox", href: "#", ct: "7" },
  { type: "item", key: "tasks", label: "Tasks", href: "#", ct: "12" },
  { type: "group", label: "Brokerage" },
  { type: "item", key: "pipeline", label: "Pipeline", href: "#" },
  { type: "item", key: "listings", label: "Listings", href: "#", ct: "128" },
  { type: "item", key: "buyers", label: "Buyers", href: "#" },
  { type: "item", key: "offers", label: "Offers", href: "#", ct: "5" },
  { type: "item", key: "closings", label: "Closings", href: "#", ct: "3" },
  { type: "group", label: "Management" },
  { type: "item", key: "vessels", label: "Vessels", href: "#", ct: "36" },
  { type: "item", key: "crew", label: "Crew", href: "#", ct: "142" },
  { type: "item", key: "charters", label: "Charters", href: "#", ct: "8" },
  { type: "item", key: "compliance", label: "Compliance", href: "#", ct: "3", alert: true },
  { type: "item", key: "reports", label: "Owner reports", href: "#" },
  { type: "group", label: "System" },
  { type: "item", key: "agents", label: "Agents", href: "#" },
  { type: "item", key: "audit", label: "Audit log", href: "#" },
];

export default function AppShell({
  active,
  user,
  rail,
  children,
}: {
  active: IconKey;
  user: { name: string; email: string; company: string; initials: string };
  rail?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`app${rail ? "" : " no-rail"}`}>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="brand">
          <TideMark variant="nav" size={22} /> Vessilon
          <span className="ws">{user.company}</span>
        </div>
        <div style={{ padding: "0 24px" }}>
          <div className="cmdk">
            <svg className="ico" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
              <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Find vessel, listing, agent, owner…
            <span className="kbd"><span>⌘</span><span>K</span></span>
          </div>
        </div>
        <div className="topright">
          <button className="nav-btn" aria-label="Inbox">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4l6 4 6-4M2 4v8h12V4M2 4l-.5-.5h13L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="badge">7</span>
          </button>
          <button className="nav-btn" aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 7a5 5 0 0110 0v3l1 2H2l1-2V7zM6 14h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="pulse" />
          </button>
          <div style={{ width: 1, height: 22, background: "var(--line)", margin: "0 6px" }} />
          <UserMenu name={user.name} email={user.email} initials={user.initials} />
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="side">
        {NAV.map((n, i) =>
          n.type === "group" ? (
            <div className="group" key={`g${i}`}>{n.label}</div>
          ) : (
            <a key={n.key} href={n.href} className={n.key === active ? "active" : undefined}>
              <svg className="ico" viewBox="0 0 14 14" fill="none">{ICONS[n.key]}</svg>
              {n.label}
              {n.ct && <span className={`ct${n.alert ? " alert" : ""}`}>{n.ct}</span>}
            </a>
          ),
        )}
        <div className="upgrade">
          <div className="l">— v3.2 release</div>
          <div className="b">Charter agent now in GA</div>
          <p>Triage MYBA inquiries and confirm APA holds automatically.</p>
          <button>See changelog</button>
        </div>
      </aside>

      {/* MAIN */}
      <main>{children}</main>

      {/* RAIL */}
      {rail && <aside className="rail">{rail}</aside>}
    </div>
  );
}
