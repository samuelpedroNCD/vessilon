import { ReactNode } from "react";
import TideMark from "@/components/TideMark";
import UserMenu from "./UserMenu";

type IconKey =
  | "overview" | "inbox" | "tasks" | "pipeline" | "listings" | "buyers"
  | "leads" | "owners" | "offers" | "closings" | "vessels" | "crew"
  | "charters" | "compliance" | "reports" | "interactions" | "companies" | "agents" | "audit";

const ICONS: Record<string, ReactNode> = {
  overview: (<><rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="7.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="1.5" y="7.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="7.5" y="7.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /></>),
  inbox: (<path d="M2 4l5-3 5 3v6l-5 3-5-3V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />),
  tasks: (<><rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M4 6l1.5 1.5L8 5M4 10l1.5 1.5L8 9" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></>),
  pipeline: (<><path d="M2 2v10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M4 8l3-3 2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></>),
  listings: (<><rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M2 6h10M5 3V1.5M9 3V1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
  buyers: (<><circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 12c.5-2 2-3 3.5-3s3 1 3.5 3M9.5 8c1.5 0 2.5 1 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
  leads: (<><path d="M1.5 2.5h11l-4 5v4.5l-3-1.5V7.5l-4-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></>),
  owners: (<><circle cx="7" cy="4.5" r="2.3" stroke="currentColor" strokeWidth="1.3" /><path d="M2.5 12c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>),
  interactions: (<><path d="M2 3.5h10v6H6l-2.5 2.5V9.5H2v-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></>),
  companies: (<><rect x="2" y="2" width="7" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M9 5h3v7H9" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M4 4.5h3M4 6.5h3M4 8.5h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></>),
  ref: (<><circle cx="7" cy="7" r="5.3" stroke="currentColor" strokeWidth="1.3" /><circle cx="7" cy="7" r="1.6" fill="currentColor" /></>),
  settings: (<><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3" /><path d="M7 1.5v1.5M7 11v1.5M12.5 7H11M3 7H1.5M10.8 3.2l-1 1M4.2 9.8l-1 1M10.8 10.8l-1-1M4.2 4.2l-1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></>),
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
  | { type: "item"; key: string; label: string; href: string; ct?: string; alert?: boolean; icon?: string; soon?: boolean };

const NAV: NavEntry[] = [
  { type: "item", key: "overview", label: "Overview", href: "/dashboard" },
  { type: "item", key: "executive", label: "Executive", href: "/executive" },
  { type: "item", key: "inbox", label: "Inbox", href: "/inbox" },
  { type: "item", key: "tasks", label: "Tasks", href: "/tasks" },
  { type: "group", label: "Brokerage" },
  { type: "item", key: "leads", label: "Leads", href: "/leads" },
  { type: "item", key: "buyers", label: "Clients", href: "/clients" },
  { type: "item", key: "pipeline", label: "Pipeline", href: "/pipeline" },
  { type: "item", key: "marketing", label: "Marketing", href: "/marketing" },
  { type: "item", key: "listings", label: "Listings", href: "#", soon: true },
  { type: "item", key: "offers", label: "Offers", href: "/offers" },
  { type: "item", key: "closings", label: "Closings", href: "/closings" },
  { type: "group", label: "Management" },
  { type: "item", key: "vessels", label: "Fleet", href: "/fleet" },
  { type: "item", key: "owners", label: "Owners", href: "/owners" },
  { type: "item", key: "crew", label: "Crew", href: "#", soon: true },
  { type: "item", key: "charters", label: "Charters", href: "#", soon: true },
  { type: "item", key: "compliance", label: "Compliance", href: "#", soon: true },
  { type: "item", key: "reports", label: "Owner reports", href: "#", soon: true },
  { type: "group", label: "DataRoom" },
  { type: "item", key: "companies", label: "Companies", href: "/companies" },
  { type: "item", key: "shipyards", label: "Shipyards", href: "/dataroom/shipyards", icon: "ref" },
  { type: "item", key: "marinas", label: "Marinas", href: "/dataroom/marinas", icon: "ref" },
  { type: "item", key: "suppliers", label: "Suppliers", href: "/dataroom/suppliers", icon: "ref" },
  { type: "item", key: "designers", label: "Designers", href: "/dataroom/designers", icon: "ref" },
  { type: "item", key: "partnerships", label: "Partnerships", href: "/dataroom/partnerships", icon: "ref" },
  { type: "item", key: "destinations", label: "Destinations", href: "/dataroom/destinations", icon: "ref" },
  { type: "group", label: "System" },
  { type: "item", key: "interactions", label: "Activity", href: "/interactions" },
  { type: "item", key: "agents", label: "Agents", href: "#", soon: true },
  { type: "item", key: "audit", label: "Audit log", href: "/audit" },
  { type: "item", key: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

export default function AppShell({
  active,
  user,
  rail,
  children,
}: {
  active: string;
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
          <a className="nav-btn" aria-label="Inbox" href="/inbox">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4l6 4 6-4M2 4v8h12V4M2 4l-.5-.5h13L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a className="nav-btn" aria-label="Notifications" href="/inbox">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 7a5 5 0 0110 0v3l1 2H2l1-2V7zM6 14h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="pulse" />
          </a>
          <div style={{ width: 1, height: 22, background: "var(--line)", margin: "0 6px" }} />
          <UserMenu name={user.name} email={user.email} initials={user.initials} />
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="side">
        {NAV.map((n, i) =>
          n.type === "group" ? (
            <div className="group" key={`g${i}`}>{n.label}</div>
          ) : n.soon ? (
            <span key={n.key} className="navsoon" aria-disabled="true">
              <svg className="ico" viewBox="0 0 14 14" fill="none">{ICONS[n.icon ?? n.key] ?? ICONS.ref}</svg>
              {n.label}
              <span className="soon">Soon</span>
            </span>
          ) : (
            <a key={n.key} href={n.href} className={n.key === active ? "active" : undefined}>
              <svg className="ico" viewBox="0 0 14 14" fill="none">{ICONS[n.icon ?? n.key] ?? ICONS.ref}</svg>
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
