"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import "../../onboarding.css";
import { WorkspacePage } from "@/components/onboarding/WorkspacePage";
import { passwordResetPath } from "@/lib/onboarding/accountPaths";
import { useAuth } from "@/lib/onboarding/auth";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const canUpdate = link === "ready" && Boolean(user);

  useEffect(() => {
    setLink(new URLSearchParams(window.location.search).get("link"));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    setNotice("");
    setError("");

    if (canUpdate && password !== form.get("confirmPassword")) {
      setError("The passwords must match.");
      return;
    }

    setBusy(true);
    try {
      const client = getSupabaseBrowser();
      if (canUpdate) {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setComplete(true);
        return;
      }

      const redirect = new URL("/auth/confirm", window.location.origin);
      redirect.searchParams.set("next", passwordResetPath);
      const email = String(form.get("email") ?? "").trim();
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirect.href });
      if (error?.status === 429 || error?.code === "over_email_send_rate_limit") {
        setError("Too many emails were requested. Wait a while before trying again.");
        return;
      }
      if (error && error.code !== "user_not_found" && error.code !== "email_address_not_authorized") {
        setError("We couldn’t send a reset link right now. Please try again later.");
        return;
      }
      setNotice("If an account exists for that address, check your inbox and spam folder for a reset link. Open it in this browser.");
    } catch (err) {
      setError(canUpdate && err instanceof Error ? err.message : "The account service is unavailable. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return <WorkspacePage><div className="onb-auth-box">
    <p className="onb-eyebrow">Your Lookrdy account</p>
    <h1 className="onb-h1">{complete ? "Password updated" : canUpdate ? "Choose a new password" : "Reset your password"}</h1>
    {complete ? (
      <div className="onb-work-actions">
        <Link className="onb-btn onb-btn--primary" href="/saved">Continue to Saved Looks</Link>
      </div>
    ) : link === "ready" && loading ? <p role="status">Checking your reset link…</p> : (
      <>
        {link && !canUpdate && <p className="onb-error" role="alert">This reset link could not be used. Request a new link and open it in this browser.</p>}
        <form className="onb-work-form" onSubmit={submit} key={canUpdate ? "update" : "request"}>
          {canUpdate ? <>
            <div>
              <label className="onb-label" htmlFor="new-password">New password</label>
              <input className="onb-field" id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div>
              <label className="onb-label" htmlFor="confirm-password">Confirm new password</label>
              <input className="onb-field" id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
            </div>
          </> : <div>
            <label className="onb-label" htmlFor="reset-email">Email</label>
            <input className="onb-field" id="reset-email" name="email" type="email" autoComplete="email" required />
          </div>}
          <div className="onb-work-actions">
            <button className="onb-btn onb-btn--primary" type="submit" disabled={busy}>
              {busy ? "Please wait…" : canUpdate ? "Update password" : "Send reset link"}
            </button>
            <Link className="onb-btn onb-btn--ghost" href="/account?mode=signin">Back to sign in</Link>
          </div>
        </form>
      </>
    )}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="onb-error" role="alert">{error}</p>}
  </div></WorkspacePage>;
}
