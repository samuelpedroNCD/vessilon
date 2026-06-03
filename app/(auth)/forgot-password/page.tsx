"use client";

import { useState } from "react";
import Link from "next/link";
import TideMark from "@/components/TideMark";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"form" | "sent">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setStatus("sent");
    setLoading(false);
  }

  if (status === "sent") {
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
            If an account exists for <b>{email}</b>, we&rsquo;ve sent a link to reset your password.
          </p>
          <div className={styles.foot}>
            Back to <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.center}>
      <div className={styles.centerCard} style={{ textAlign: "left" }}>
        <div style={{ textAlign: "center" }}>
          <div className={styles.ico}>
            <div className={styles.ring}>
              <TideMark variant="reversed" size={30} />
            </div>
          </div>
        </div>
        <div className={styles.eyebrow} style={{ textAlign: "center" }}>
          Reset access
        </div>
        <h1 className={styles.title} style={{ fontSize: 24, textAlign: "center" }}>
          Forgot your password?
        </h1>
        <p className={styles.sub} style={{ textAlign: "center" }}>
          Enter your work email and we&rsquo;ll send you a link to set a new one.
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
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
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Sending…" : "Send reset link →"}
          </button>
        </form>

        <div className={styles.foot}>
          Remembered it? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
