"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TideMark from "@/components/TideMark";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

const STEPS = [
  { t: "Create account", d: "Name, work email, password" },
  { t: "Your company", d: "Tell us about the operation" },
  { t: "Connect data", d: "YATCO, Boats Group, or CSV" },
  { t: "Invite your team", d: "Brokers, managers, captains" },
];

const ACCOUNT_TYPES = [
  { key: "brokerage", t: "Brokerage", d: "Sales & listings" },
  { key: "management", t: "Management", d: "Vessels & crew" },
  { key: "both", t: "Both", d: "Full platform" },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"form" | "check-email">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    accountType: "brokerage",
    companyName: "",
    fleetSize: "11–30 vessels",
    region: "Western Mediterranean",
    role: "",
    teamSize: "11–25",
  });
  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Invite link: ?invite=token joins an existing workspace with a set role.
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<{ org: string; role: string } | null>(null);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("invite");
    if (!t) return;
    setInviteToken(t);
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc("invite_info", { p_token: t });
      if (data) setInvite({ org: (data as any).org, role: (data as any).role });
    })();
  }, []);

  function next() {
    setError(null);
    if (step === 1) {
      if (!form.fullName || !form.email || form.password.length < 6) {
        setError("Enter your name, work email, and a password of at least 6 characters.");
        return;
      }
    }
    if (step === 2 && !form.companyName) {
      setError("Add your company name.");
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }
  const back = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  async function createWorkspace() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        data: {
          full_name: form.fullName,
          account_type: form.accountType,
          company_name: form.companyName,
          fleet_size: form.fleetSize,
          region: form.region,
          role: form.role,
          team_size: form.teamSize,
          ...(inviteToken ? { invite_token: inviteToken } : {}),
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    // Email confirmation required (Supabase default).
    setStatus("check-email");
    setLoading(false);
  }

  if (status === "check-email") {
    return (
      <div className={styles.center}>
        <div className={styles.centerCard}>
          <div className={styles.ico}>
            <div className={styles.ring}>
              <TideMark variant="reversed" size={30} />
            </div>
          </div>
          <h1 className={styles.title} style={{ fontSize: 24 }}>
            Check your email
          </h1>
          <p className={styles.sub} style={{ marginBottom: 8 }}>
            We sent a confirmation link to <b>{form.email}</b>. Click it to activate your
            workspace, then you&rsquo;ll land in Vessilon.
          </p>
          <div className={styles.foot}>
            Wrong address? <Link href="/signup">Start over</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.splitSignup}>
      {/* STEPS */}
      <div className={styles.stepsSide}>
        <Link href="/" className={styles.stepsBrand}>
          <TideMark variant="nav-reversed" size={24} /> Vessilon
        </Link>

        <div className={styles.intro}>
          <h2>
            Bring your fleet <em>aboard.</em>
          </h2>
          <p>
            Most teams are running production work inside 7 days. A migration engineer is assigned
            for fleets over 10 vessels.
          </p>
        </div>

        <div className={styles.steplist}>
          {STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? styles.stpDone : n === step ? styles.stpActive : styles.stpTodo;
            return (
              <div key={s.t} className={`${styles.stp} ${state}`}>
                <div className={styles.dot}>{n < step ? "✓" : n}</div>
                <div>
                  <div className={styles.t}>{s.t}</div>
                  <div className={styles.d}>{s.d}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.stepsFoot}>Step {step} of 4</div>
      </div>

      {/* FORM */}
      <div className={styles.formSideWide}>
        <div className={styles.top}>
          <div className={styles.right}>
            Already aboard? <Link href="/login">Sign in</Link>
          </div>
        </div>

        <div className={styles.formWrapWide}>
          {invite && (
            <div className={styles.errorBox} style={{ background: "#eef2ef", color: "#0f3b2e", border: "1px solid rgba(15,59,46,0.2)" }}>
              You&rsquo;re joining <b>{invite.org}</b> as <b>{invite.role.replace(/_/g, " ")}</b>. Complete signup to accept.
            </div>
          )}
          {error && <div className={styles.errorBox}>{error}</div>}

          {step === 1 && (
            <>
              <div className={styles.eyebrow}>Create your account</div>
              <h1 className={styles.titleSignup}>Let&rsquo;s get you aboard.</h1>
              <p className={styles.sub}>Start with your details — this becomes your sign-in.</p>
              <div className={styles.grid2}>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>Full name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    placeholder="Théo Marek"
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>Work email</label>
                  <input
                    type="email"
                    value={form.email}
                    placeholder="you@brokerage.com"
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={form.password}
                    placeholder="At least 6 characters"
                    onChange={(e) => set("password", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.eyebrow}>Set up your workspace</div>
              <h1 className={styles.titleSignup}>Tell us about your company.</h1>
              <p className={styles.sub}>
                This shapes which stations and integrations we switch on for your pilot.
              </p>

              <div className={styles.roleSeg}>
                {ACCOUNT_TYPES.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    className={`${styles.opt} ${form.accountType === a.key ? styles.optOn : ""}`}
                    onClick={() => set("accountType", a.key)}
                  >
                    <div className={styles.t}>{a.t}</div>
                    <div className={styles.d}>{a.d}</div>
                  </button>
                ))}
              </div>

              <div className={styles.grid2}>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>Company name</label>
                  <input
                    type="text"
                    value={form.companyName}
                    placeholder="Marettimo & Co."
                    onChange={(e) => set("companyName", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Fleet size</label>
                  <select value={form.fleetSize} onChange={(e) => set("fleetSize", e.target.value)}>
                    <option>1–5 vessels</option>
                    <option>6–10 vessels</option>
                    <option>11–30 vessels</option>
                    <option>30+ vessels</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Primary region</label>
                  <select value={form.region} onChange={(e) => set("region", e.target.value)}>
                    <option>Western Mediterranean</option>
                    <option>Caribbean</option>
                    <option>US East Coast</option>
                    <option>Northern Europe</option>
                    <option>Asia-Pacific</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Your role</label>
                  <input
                    type="text"
                    value={form.role}
                    placeholder="Managing Director"
                    onChange={(e) => set("role", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Team size</label>
                  <select value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)}>
                    <option>1–10</option>
                    <option>11–25</option>
                    <option>26–50</option>
                    <option>50+</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.eyebrow}>Connect your data</div>
              <h1 className={styles.titleSignup}>Bring your fleet in.</h1>
              <p className={styles.sub}>
                Sync now or skip — you can connect sources any time from Settings.
              </p>
              <div className={styles.roleSeg}>
                {[
                  { t: "YATCO", d: "2-way listings" },
                  { t: "Boats Group", d: "2-way listings" },
                  { t: "CSV import", d: "One-time upload" },
                ].map((s) => (
                  <div key={s.t} className={styles.opt}>
                    <div className={styles.t}>{s.t}</div>
                    <div className={styles.d}>{s.d}</div>
                  </div>
                ))}
              </div>
              <p className={styles.legal}>A migration engineer wires these up during your pilot.</p>
            </>
          )}

          {step === 4 && (
            <>
              <div className={styles.eyebrow}>Invite your team</div>
              <h1 className={styles.titleSignup}>Who&rsquo;s coming aboard?</h1>
              <p className={styles.sub}>
                Add brokers, managers and captains now, or invite them later from Settings.
              </p>
              <div className={`${styles.field} ${styles.full}`}>
                <label>Teammate emails (optional)</label>
                <input type="text" placeholder="broker@brokerage.com, captain@brokerage.com" />
              </div>
              <p className={styles.legal}>
                By creating your workspace you agree to the MSA &amp; DPA · SOC 2 Type II · GDPR
              </p>
            </>
          )}

          <div className={styles.actions}>
            {step > 1 && (
              <button type="button" className={styles.btnGhost} onClick={back}>
                ← Back
              </button>
            )}
            {step < 4 ? (
              <button type="button" className={styles.btnPill} onClick={next}>
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnPill}
                onClick={createWorkspace}
                disabled={loading}
              >
                {loading ? "Creating…" : "Create workspace →"}
              </button>
            )}
            <span className={styles.note}>⏎ to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
}
