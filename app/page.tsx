import TideMark from "@/components/TideMark";

export default function Home() {
  return (
    <>
      <div style={{ height: 16 }} />
      <nav className="top">
        <div className="container">
          <div className="inner">
            <a className="brand" href="#">
              <span className="brand-mark">
                <TideMark variant="nav" size={24} />
              </span>{" "}
              Vessilon
            </a>
            <div className="nav-links">
              <a href="#platform">Platform</a>
              <a href="#lobs">Lines of business</a>
              <a href="#agents">Agents</a>
              <a href="#integrations">Integrations</a>
              <a href="#customers">Customers</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="nav-right">
              <a className="btn ghost">Sign in</a>
              <a className="btn outline">Talk to sales</a>
              <a className="btn primary">Start a pilot →</a>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <div>
                <div className="eyebrow">
                  <span className="pulse" /> The operating system for yacht brokerage
                </div>
                <h1>
                  Run the
                  <br />
                  brokerage,
                  <br />
                  not the&nbsp;<span className="ital">spreadsheet.</span>
                </h1>
                <p className="sub">
                  Vessilon is the fleet-first, AI-native platform that unifies your brokerage
                  on a single source of truth — where the yacht is the primary object. Listings,
                  leads and deals across every line of business, brochures, marketing and owner
                  reporting, in one workspace.
                </p>
                <div className="cta-row">
                  <a className="btn primary">Start a 14-day pilot</a>
                  <a className="btn outline">Watch a 3-min product tour →</a>
                </div>
                <div className="hero-stats">
                  <div className="s">
                    <div className="v">6 → 1</div>
                    <div className="l">Lines of business, one vessel record</div>
                  </div>
                  <div className="s">
                    <div className="v">$4.1B</div>
                    <div className="l">Gross transaction volume processed</div>
                  </div>
                  <div className="s">
                    <div className="v">11 hrs</div>
                    <div className="l">Saved per broker per week</div>
                  </div>
                </div>
              </div>

              {/* HERO CARD */}
              <div className="hero-col">
                <div className="hero-card">
                  <div className="hc-head">
                    <span className="dot" />
                    <span className="title">Broker Portal — Your Wednesday</span>
                    <span className="menu">⌘ B</span>
                  </div>
                  <div className="hc-tabs">
                    <span className="active">Today</span>
                    <span>Pipeline</span>
                    <span>Fleet</span>
                    <span>Inbox</span>
                  </div>

                  <div className="vessel-row">
                    <div className="vthumb" />
                    <div>
                      <div className="vname">M/Y Astralis · counter sent</div>
                      <div className="vsub">Sale · 54m · BEN84221J920</div>
                    </div>
                    <span className="vstage green">offer</span>
                    <span className="vval">$37.4M</span>
                  </div>
                  <div className="vessel-row">
                    <div className="vthumb b" />
                    <div>
                      <div className="vname">S/Y Polaris IV · proposal due</div>
                      <div className="vsub">Charter · 38m · NAU63310K121</div>
                    </div>
                    <span className="vstage amber">deposit</span>
                    <span className="vval">€186k/wk</span>
                  </div>
                  <div className="vessel-row">
                    <div className="vthumb c" />
                    <div>
                      <div className="vname">M/Y Caelum · 2 showings booked</div>
                      <div className="vsub">Sale · 42m · LUR55709A722</div>
                    </div>
                    <span className="vstage blue">viewing</span>
                    <span className="vval">$22.0M</span>
                  </div>
                  <div className="vessel-row">
                    <div className="vthumb d" />
                    <div>
                      <div className="vname">Hull 412 · milestone signed</div>
                      <div className="vsub">New Build · 47m · Feadship</div>
                    </div>
                    <span className="vstage green">build</span>
                    <span className="vval">€38.0M</span>
                  </div>

                  <div className="hc-foot">
                    <span className="agent">Vessilon · 4 drafts ready for review</span>
                    <span style={{ marginLeft: "auto" }}>synced 14s ago</span>
                  </div>
                </div>

                <div className="whisper">
                  <div className="ic" />
                  <p>
                    <b>New enquiry on M/Y Astralis — classified Sale · Hot.</b> I pre-filled the
                    lead, matched 3 fleet yachts to their brief, and drafted a viewing reply with
                    the Sale brochure attached.
                  </p>
                  <span className="a">Open ⌘O</span>
                </div>
              </div>
            </div>

            {/* LOGOS */}
            <div className="strip" id="customers">
              <div className="strip-label">— brokerages &amp; management cos running on Vessilon —</div>
              <div className="logos">
                <div className="logo-cell">NORTHWIND</div>
                <div className="logo-cell italic">Marettimo &amp; Co.</div>
                <div className="logo-cell serif">Halcyon Marine</div>
                <div className="logo-cell">CARDINAL/YACHT</div>
                <div className="logo-cell italic">Ostara</div>
                <div className="logo-cell serif">Bluepoint Mgmt</div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM / WORKSPACES */}
        <section className="block" style={{ paddingTop: 0 }} id="platform">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="l">01 — The platform</div>
                <h2>
                  One workspace
                  <br />
                  per fleet, <em>per role.</em>
                </h2>
              </div>
              <div>
                <p>
                  Brokers, marketers, operations and leadership all see the same vessel — through
                  the lens that matters to them. Every record, every relationship and every deal
                  orbits the yacht. No more 14 tools, no more &ldquo;let me check with the office.&rdquo;
                </p>
              </div>
            </div>

            <div className="modules">
              <div className="mod big">
                <div className="tag-row">
                  <span className="sq" /> 01 · Broker Portal
                </div>
                <h3>Every listing, every lead, every deal — in one moving picture.</h3>
                <p>
                  The broker&rsquo;s daily cockpit: fleet, clients, leads, multi-LOB pipeline, tasks,
                  inbox and brochures. The pipeline updates itself as offers move, viewings land and
                  prices change — so you always know what needs you today.
                </p>
                <div className="vis">
                  <div className="pipemini">
                    <div className="row">
                      <span>Weighted pipeline</span>
                      <span>$612M</span>
                    </div>
                    <div className="row">
                      <span>This week&rsquo;s offers</span>
                      <span>5</span>
                    </div>
                    <div className="row">
                      <span>Closings · next 30d</span>
                      <span>3</span>
                    </div>
                    <hr />
                    <div className="row">
                      <span>Astralis · counter</span>
                      <span style={{ color: "#8de0bf" }}>drafted</span>
                    </div>
                    <div className="row">
                      <span>Caelum · sea trial</span>
                      <span style={{ color: "#e6c992" }}>Fri 14:00</span>
                    </div>
                    <div className="row">
                      <span>Larkspur · 112d stale</span>
                      <span style={{ color: "#f5b386" }}>flagged</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mod">
                <div className="tag-row">
                  <span className="sq" /> 02 · Fleet CRM
                </div>
                <h3>The yacht is the primary object.</h3>
                <p>Owners, clients, leads and opportunities all link back to the vessel record.</p>
                <div className="vis">
                  <div className="crmmini">
                    <div className="node lead">
                      <span className="k">LD</span>
                      <div>
                        Hot lead · Sale
                        <small>matched to M/Y Astralis</small>
                      </div>
                    </div>
                    <div className="node client">
                      <span className="k">CL</span>
                      <div>
                        Client · 3 active opps
                        <small>buyer + charter guest</small>
                      </div>
                    </div>
                    <div className="node deal">
                      <span className="k">OP</span>
                      <div>
                        Opportunity · Offer
                        <small>weighted $37.4M</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mod">
                <div className="tag-row">
                  <span className="sq" /> 03 · Brochures &amp; AI copy
                </div>
                <h3>Branded brochures, generated in a click.</h3>
                <p>Assemble Sale, Charter and Full-Spec brochures from the vessel — with AI listing copy, tracked share links and auto-logged interactions.</p>
                <div className="vis">
                  <div className="broch">
                    <div className="pg" />
                    <div className="pg ai" />
                    <div className="pg" />
                  </div>
                </div>
              </div>

              <div className="mod">
                <div className="tag-row">
                  <span className="sq" /> 04 · Leads &amp; prospecting
                </div>
                <h3>AI intake in, Apollo prospecting out.</h3>
                <p>Website forms arrive classified and pre-filled. Prospect new owners without leaving the platform.</p>
                <div className="vis">
                  <div className="leadmini">
                    <div className="lr">
                      <span className="nm">
                        Inbound · Monaco
                        <small>charter · 42m · Aug</small>
                      </span>
                      <span className="pill hot">HOT</span>
                    </div>
                    <div className="lr">
                      <span className="nm">
                        Apollo · UAE HNW
                        <small>imported · sequence 2/5</small>
                      </span>
                      <span className="pill warm">WARM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mod">
                <div className="tag-row">
                  <span className="sq" /> 05 · CEO Dashboard
                </div>
                <h3>The whole business, at a glance.</h3>
                <p>Live pipeline, revenue, broker activity and fleet health — pre-aggregated, no analyst required.</p>
                <div className="vis">
                  <div className="dashmini">
                    <div className="b">
                      <div className="v">$612M</div>
                      pipeline
                    </div>
                    <div className="b">
                      <div className="v">−38%</div>
                      days-on-market
                    </div>
                    <div className="b">
                      <div className="v">94</div>
                      NPS
                    </div>
                    <div className="b">
                      <div className="v">26</div>
                      won · YTD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LINES OF BUSINESS */}
        <section className="block" style={{ paddingTop: 0 }} id="lobs">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="l">02 — Lines of business</div>
                <h2>
                  Six businesses.
                  <br />
                  <em>Six pipelines.</em> One vessel.
                </h2>
              </div>
              <div>
                <p>
                  Sale, Charter, Co-Ownership, New Builds, Trade and Services aren&rsquo;t tags on a
                  generic deal. Each is a first-class commercial context — its own stages, fields,
                  brochure type and reporting — modelled from the database up.
                </p>
              </div>
            </div>

            <div className="lobs">
              <div className="lob">
                <div className="lob-h">
                  <span className="num">01</span>
                  <h4>Sale</h4>
                </div>
                <p>Sell-side and buy-side mandates, offers, survey &amp; sea trial, closing checklist.</p>
                <div className="stages">
                  <span className="chip">Enquiry</span>
                  <span className="chip">Qualified</span>
                  <span className="chip">Viewing</span>
                  <span className="chip">Offer</span>
                  <span className="chip">Survey</span>
                  <span className="chip last">Completion</span>
                </div>
              </div>

              <div className="lob">
                <div className="lob-h">
                  <span className="num">02</span>
                  <h4>Charter</h4>
                </div>
                <p>Availability, MYBA/CYBA dispatch, deposits, APA settlement, central vs retail agency.</p>
                <div className="stages">
                  <span className="chip">Enquiry</span>
                  <span className="chip">Availability</span>
                  <span className="chip">Proposal</span>
                  <span className="chip">Deposit</span>
                  <span className="chip">Contract</span>
                  <span className="chip last">Completed</span>
                </div>
              </div>

              <div className="lob">
                <div className="lob-h">
                  <span className="num">03</span>
                  <h4>New Builds</h4>
                </div>
                <p>Shipyard shortlist, design proposals, milestone &amp; stage-payment tracking to delivery.</p>
                <div className="stages">
                  <span className="chip">Brief</span>
                  <span className="chip">Shortlist</span>
                  <span className="chip">Design</span>
                  <span className="chip">Build</span>
                  <span className="chip last">Delivery</span>
                </div>
              </div>

              <div className="lob">
                <div className="lob-h">
                  <span className="num">04</span>
                  <h4>Co-Ownership</h4>
                </div>
                <p>Share schemes, shareholder records, usage calendar, reserve fund and exit mechanism.</p>
                <div className="stages">
                  <span className="chip">Application</span>
                  <span className="chip">Review</span>
                  <span className="chip">Share Agreement</span>
                  <span className="chip">Onboarding</span>
                  <span className="chip last">Active</span>
                </div>
              </div>

              <div className="lob">
                <div className="lob-h">
                  <span className="num">05</span>
                  <h4>Trade</h4>
                </div>
                <p>Part-exchange valuations linked to the primary deal, plus B2B fleet transactions.</p>
                <div className="stages">
                  <span className="chip">Valuation</span>
                  <span className="chip">Accepted</span>
                  <span className="chip">Part-Exchange</span>
                  <span className="chip last">Completion</span>
                </div>
              </div>

              <div className="lob">
                <div className="lob-h">
                  <span className="num">06</span>
                  <h4>Services</h4>
                </div>
                <p>After-sales &amp; management — recurring revenue with renewal tracking and SLAs.</p>
                <div className="stages">
                  <span className="chip">Scope</span>
                  <span className="chip">Proposal</span>
                  <span className="chip">Agreement</span>
                  <span className="chip">Active</span>
                  <span className="chip last">Renewal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AGENTS */}
        <section className="block" style={{ paddingTop: 0 }} id="agents">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="l">03 — Agents</div>
                <h2>
                  AI that does the work,
                  <br />
                  not the demo.
                </h2>
              </div>
              <div>
                <p>
                  Every Vessilon agent is scoped to your data, your permissions and your playbooks.
                  They classify, draft and follow up — and every output is reviewable before it
                  publishes, fully audited and attributed to a human.
                </p>
              </div>
            </div>

            <div className="workflow">
              <div className="wf-tabs">
                <div className="wf-tab active">
                  <div className="step">STEP 01</div>
                  <h4>Lead intake &amp; triage</h4>
                </div>
                <div className="wf-tab">
                  <div className="step">STEP 02</div>
                  <h4>AI listing copy</h4>
                </div>
                <div className="wf-tab">
                  <div className="step">STEP 03</div>
                  <h4>Brochure generation</h4>
                </div>
                <div className="wf-tab">
                  <div className="step">STEP 04</div>
                  <h4>Owner reporting</h4>
                </div>
              </div>

              <div className="wf-body">
                <div className="wf-left">
                  <h3>
                    A website form lands.
                    <br />
                    Get a classified, pre-filled lead and a drafted reply.
                  </h3>
                  <p>
                    Vessilon&rsquo;s intake agent reads every enquiry the way a senior broker would.
                    It classifies the line of business, extracts the brief, scores intent, and
                    matches the lead against your live fleet — before a broker even opens it.
                  </p>
                  <ul>
                    <li>Classifies LOB with a confidence score</li>
                    <li>Extracts budget, size, region and timing into a preference profile</li>
                    <li>Matches the brief to ranked fleet yachts</li>
                    <li>Detects duplicates and flags GDPR consent</li>
                    <li>Drafts a viewing reply with the right brochure attached</li>
                  </ul>
                </div>
                <div className="wf-right">
                  <div className="console-card">
                    <div className="head">
                      <div className="dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      intake-agent · web-form #20418 · v4.1
                    </div>
                    <span className="you">$ vessilon lead ingest --source webflow form-20418.json</span>
                    <br />
                    → parsed enquiry · extracted 9 fields
                    <br />
                    → classified: <span className="ok">Sale</span> · confidence 0.94 · intent{" "}
                    <span className="ok">Hot</span>
                    <br />
                    → brief: 50–56m · motor · Med · &lt; $40M · Q3
                    <br />
                    <div className="out">
                      <b>Matched fleet (3)</b>
                      <br />
                      · M/Y Astralis · 54m · $37.4M · ▲ best fit
                      <br />
                      · M/Y Caelum · 42m · $22.0M
                      <br />
                      · M/Y Vela · 51m · $34.9M
                    </div>
                    <span className="you">$ vessilon lead draft-reply --match astralis</span>
                    <br />
                    → duplicate check: <span className="ok">clean</span> · consent: captured
                    <br />
                    → drafted viewing reply + Sale brochure ·{" "}
                    <span className="ok">ready for review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="block" style={{ paddingTop: 0 }} id="integrations">
          <div className="container">
            <div className="ints-row">
              <div>
                <div className="section-head" style={{ display: "block", marginBottom: 0 }}>
                  <div className="l" style={{ marginBottom: 10 }}>
                    04 — Wired in
                  </div>
                  <h2>
                    Reads &amp; writes <em>where your team already works.</em>
                  </h2>
                </div>
                <p
                  style={{
                    color: "var(--ink-2)",
                    maxWidth: 480,
                    margin: "22px 0 0",
                    lineHeight: 1.55,
                    fontSize: 17,
                  }}
                >
                  Native website sync, email, calendar, marketing and prospecting — plus a typed API
                  and webhooks. Row-level permissions on anything that touches owner or client data,
                  and full tenant isolation. No middleware, no expiring tokens.
                </p>
              </div>
              <div className="ints">
                <div className="int">
                  <div className="sq">WF</div>
                  <div>
                    Website sync
                    <small>native · live</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">GM</div>
                  <div>
                    Gmail
                    <small>2-way · oauth</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">OL</div>
                  <div>
                    Outlook
                    <small>2-way · oauth</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">GC</div>
                  <div>
                    Google Cal
                    <small>2-way sync</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">GA</div>
                  <div>
                    Analytics
                    <small>GA4 · datastudio</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">BR</div>
                  <div>
                    Brevo
                    <small>email · stats</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">MA</div>
                  <div>
                    Meta Ads
                    <small>spend · attrib</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">AP</div>
                  <div>
                    Apollo.io
                    <small>prospecting</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">MY</div>
                  <div>
                    MYBA / CYBA
                    <small>charter sync</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">DS</div>
                  <div>
                    DocuSign
                    <small>e-sign</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">SP</div>
                  <div>
                    Spire AIS
                    <small>positions</small>
                  </div>
                </div>
                <div className="int">
                  <div className="sq">+</div>
                  <div>
                    Webhooks &amp; API
                    <small>typed SDK</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="quote-card">
              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--signal)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                    marginBottom: 16,
                  }}
                >
                  05 — In production
                </div>
                <blockquote>
                  We retired three SaaS contracts and a 14-tab master sheet inside a quarter.{" "}
                  <em>
                    The agent doesn&rsquo;t replace our brokers — it removes the 40% of the day they
                    spent moving information.
                  </em>
                </blockquote>
                <div className="who">
                  <div className="av" />
                  <div className="nm">
                    Théo Marek
                    <small>Managing Director · Marettimo &amp; Co.</small>
                  </div>
                </div>
              </div>
              <div className="stat-side">
                <div className="st">
                  <div className="v">−38%</div>
                  <div className="l">Avg days-on-market</div>
                </div>
                <div className="st">
                  <div className="v">11 hrs</div>
                  <div className="l">Saved per broker / week</div>
                </div>
                <div className="st">
                  <div className="v">6 LOBs</div>
                  <div className="l">On one vessel record</div>
                </div>
                <div className="st">
                  <div className="v">94 NPS</div>
                  <div className="l">From operations team</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing">
          <div className="container">
            <div className="cta">
              <div>
                <h2>
                  The bridge is open.
                  <br />
                  <em>Bring your fleet aboard.</em>
                </h2>
                <p>
                  14-day pilot, no procurement cycle, a migration engineer on call. Most teams are
                  running production work inside 7 days.
                </p>
                <div className="cta-row">
                  <a className="btn primary">Start a 14-day pilot</a>
                  <a className="btn outline">Talk to a brokerage SE</a>
                </div>
              </div>
              <div className="cta-card-2">
                <div className="li">Migration from generic CRMs, spreadsheets, CSV or bespoke</div>
                <div className="li">Sandbox loaded with your live fleet for the demo</div>
                <div className="li">SOC 2 Type II · GDPR · EU / US data residency</div>
                <div className="li">Multi-office &amp; multi-tenant from day one</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container frow">
          <div>© 2026 Vessilon Operations Inc.</div>
          <div>Built for the way yacht teams work</div>
          <div className="right">
            <a>Status</a>
            <a>Security</a>
            <a>Docs</a>
            <a>Changelog</a>
            <a>X / @vessilon</a>
          </div>
        </div>
      </footer>
    </>
  );
}
