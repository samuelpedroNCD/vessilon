"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TideMark from "@/components/TideMark";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

function GoogleIcon() {
  return (
    <svg className={styles.g} viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.5 18 9 18z" />
      <path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.5 0 9s.3 2.8.9 4l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.5 0 2.4 2.1.9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className={styles.g} viewBox="0 0 18 18" fill="#15171a">
      <path d="M9 0H0v9h9V0zm9 0H9v9h9V0zM9 9H0v9h9V9zm9 0H9v9h9V9z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const dest = params.get("redirectedFrom") || "/dashboard";
    router.push(dest);
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "azure") {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(
        `${provider === "google" ? "Google" : "Microsoft"} sign-in isn't configured yet — add the provider in Supabase Auth → Providers.`,
      );
    }
  }

  return (
    <div className={styles.split}>
      {/* FORM */}
      <div className={styles.formSide}>
        <Link href="/" className={styles.brand}>
          <TideMark variant="nav" size={24} /> Vessilon
        </Link>

        <div className={styles.formWrap}>
          <div className={styles.eyebrow}>Welcome back</div>
          <h1 className={styles.title}>Sign in to your bridge.</h1>
          <p className={styles.sub}>
            Operational infrastructure for yacht brokerages and management companies.
          </p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.sso}>
            <button type="button" className={styles.ssoBtn} onClick={() => handleOAuth("google")}>
              <GoogleIcon /> Continue with Google
            </button>
            <button type="button" className={styles.ssoBtn} onClick={() => handleOAuth("azure")}>
              <MicrosoftIcon /> Continue with Microsoft
            </button>
          </div>

          <div className={styles.divider}>or with email</div>

          <form onSubmit={handleSignIn}>
            <div className={styles.field}>
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@brokerage.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <div className={styles.fieldRow}>
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password">Forgot?</Link>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div className={styles.foot}>
            New to Vessilon? <Link href="/signup">Request access</Link>
          </div>
        </div>

        <div className={styles.legal}>SOC 2 Type II · GDPR · © 2026 Vessilon Operations Inc.</div>
      </div>

      {/* PREVIEW */}
      <div className={styles.previewSide}>
        <div className={styles.glow} />
        <div className={styles.pquote}>
          <div className={styles.mark}>
            <TideMark variant="reversed" size={44} />
          </div>
          <blockquote className={styles.quote}>
            We retired three SaaS contracts and a 14-tab master sheet inside a quarter.{" "}
            <em>
              The agent doesn&rsquo;t replace our brokers — it removes the 40% of the day they spent
              moving information.
            </em>
          </blockquote>
          <div className={styles.who}>
            <div className={styles.av} />
            <div className={styles.nm}>
              Théo Marek
              <small>Managing Director · Marettimo &amp; Co.</small>
            </div>
          </div>
        </div>

        <div className={styles.floatCard}>
          <div className={styles.fh}>
            <span className={styles.pulse} /> Negotiation agent
          </div>
          <p>
            <b>M/Y Astralis</b> · counter at $37.4M drafted from 6 comps. Ready for review.
          </p>
          <div className={styles.stat}>
            <div>
              <div className={styles.v}>$612M</div>
              <div className={styles.l}>Pipeline</div>
            </div>
            <div>
              <div className={styles.v}>36</div>
              <div className={styles.l}>Vessels</div>
            </div>
            <div>
              <div className={styles.v}>98%</div>
              <div className={styles.l}>Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
