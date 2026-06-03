"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TideMark from "@/components/TideMark";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "ok" | "expired">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The recovery link routes through /auth/confirm, which sets a session.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setReady(data.user ? "ok" : "expired");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Use a password of at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (ready === "expired") {
    return (
      <div className={styles.center}>
        <div className={styles.centerCard}>
          <div className={styles.ico}>
            <div className={styles.ring}>
              <TideMark variant="reversed" size={30} />
            </div>
          </div>
          <h1 className={styles.title} style={{ fontSize: 24 }}>
            Link expired
          </h1>
          <p className={styles.sub} style={{ marginBottom: 8 }}>
            This password-reset link is invalid or has expired. Request a fresh one.
          </p>
          <div className={styles.foot}>
            <Link href="/forgot-password">Send a new link</Link>
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
          Set a new password
        </div>
        <h1 className={styles.title} style={{ fontSize: 24, textAlign: "center" }}>
          Choose a new password.
        </h1>
        <p className={styles.sub} style={{ textAlign: "center" }}>
          Pick something at least 6 characters. You&rsquo;ll be signed straight in.
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={ready !== "ok"}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              required
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={ready !== "ok"}
            />
          </div>
          <button type="submit" className={styles.btnPrimary} disabled={loading || ready !== "ok"}>
            {loading ? "Updating…" : "Update password →"}
          </button>
        </form>

        <div className={styles.foot}>
          Back to <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
