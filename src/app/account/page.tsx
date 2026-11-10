"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../onboarding.css";
import { WorkspacePage } from "@/components/onboarding/WorkspacePage";
import { accountReturnPath, passwordResetPath } from "@/lib/onboarding/accountPaths";
import { useAuth, signOut } from "@/lib/onboarding/auth";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [next, setNext] = useState("/saved");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(accountReturnPath(params.get("next")));
    if (params.get("mode") === "signin" || params.get("confirmation") === "failed") {
      setMode("signin");
    }
    if (params.get("confirmation") === "failed") {
      setError("The confirmation link couldn’t finish in this browser. Confirm your email, then try signing in.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true); setNotice(""); setError("");
    try {
      const client = getSupabaseBrowser();
      const redirect = new URL("/auth/confirm", window.location.origin);
      redirect.searchParams.set("next", next);
      const response = mode === "signin"
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signUp({ email, password, options: { emailRedirectTo: redirect.href } });
      if (response.error) throw response.error;
      if (response.data.session) router.push(next);
      else setNotice("Check your email to confirm your account, then sign in to continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account service unavailable.");
    } finally { setBusy(false); }
  }

  return <WorkspacePage><div className="onb-auth-box">
    <p className="onb-eyebrow">Your Lookrdy account</p>
    <h1 className="onb-h1">{user ? "You’re signed in" : mode === "signup" ? "Keep your best looks" : "Welcome back"}</h1>
    <p className="onb-lede">Save outfits, revisit your history, and keep styling with your wardrobe or Simons.</p>
    {loading ? <p role="status">Checking your account…</p> : user ? (
      <div className="onb-work-actions">
        <Link className="onb-btn onb-btn--primary" href={next}>Continue</Link>
        <button className="onb-btn onb-btn--ghost" type="button" onClick={() => void signOut()}>Sign out</button>
      </div>
    ) : (
      <form className="onb-work-form" onSubmit={submit}>
        <div><label className="onb-label" htmlFor="account-email">Email</label><input className="onb-field" id="account-email" name="email" type="email" autoComplete="email" required /></div>
        <div><label className="onb-label" htmlFor="account-password">Password</label><input className="onb-field" id="account-password" name="password" type="password" minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} required /></div>
        <div className="onb-work-actions">
          <button className="onb-btn onb-btn--primary" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
          <button className="onb-btn onb-btn--ghost" type="button" disabled={busy} onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setNotice(""); }}>{mode === "signup" ? "I already have an account" : "Create an account"}</button>
          <Link className="onb-btn onb-btn--ghost" href={passwordResetPath}>Forgot password?</Link>
        </div>
      </form>
    )}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="onb-error" role="alert">{error}</p>}
  </div></WorkspacePage>;
}
