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
  const [mode, setMode] = useState<"signup" | "signin">("signin");
  const [next, setNext] = useState("/saved");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(accountReturnPath(params.get("next")));
    if (params.get("mode") === "signup" || (params.has("next") && !params.has("mode") && !params.has("confirmation"))) setMode("signup");
    if (params.get("confirmation") === "failed") {
      setError("The confirmation link couldn’t finish in this browser. Confirm your email, then try signing in.");
    }
  }, []);

  function switchMode(value: "signup" | "signin") {
    setMode(value);
    setPendingEmail("");
    setNotice("");
    setError("");
  }

  function confirmationRedirect() {
    const redirect = new URL("/auth/confirm", window.location.origin);
    redirect.searchParams.set("next", next);
    return redirect.href;
  }

  function showAuthError(err: unknown, address = email.trim()) {
    const code = err && typeof err === "object" && "code" in err ? err.code : null;
    if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") {
      setError("Too many requests. Wait a while before trying again.");
    } else if (code === "email_not_confirmed") {
      setPendingEmail(address);
      setError("Open the confirmation link in your email before signing in.");
    } else if (code === "invalid_credentials") {
      setError("That email and password didn’t match. Try again or reset your password.");
    } else {
      setError(err instanceof Error ? err.message : "Account service unavailable.");
    }
  }

  async function resendConfirmation() {
    if (busy || !pendingEmail) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { error } = await getSupabaseBrowser().auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: confirmationRedirect() },
      });
      if (error) throw error;
      setNotice("If this address still needs confirmation, check your inbox and spam folder for the latest link.");
    } catch (err) { showAuthError(err); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const address = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true); setNotice(""); setError("");
    try {
      const client = getSupabaseBrowser();
      const response = mode === "signin"
        ? await client.auth.signInWithPassword({ email: address, password })
        : await client.auth.signUp({ email: address, password, options: { emailRedirectTo: confirmationRedirect() } });
      if (response.error) throw response.error;
      if (response.data.session) router.push(next);
      else {
        setPendingEmail(address);
        setNotice("Check your inbox and spam folder for a confirmation link. Open it in the browser where you signed up.");
      }
    } catch (err) {
      showAuthError(err, address);
    } finally { setBusy(false); }
  }

  return <WorkspacePage auth={!user}><div className="onb-auth-box">
    <p className="onb-eyebrow">Your Lookrdy account</p>
    <h1 className="onb-h1">{user ? "My account" : mode === "signup" ? "Create your Lookrdy account" : "Welcome back"}</h1>
    <p className="onb-lede">{user ? user.email : "Save your wardrobe, keep your favorite looks, and organize them into collections."}</p>
    {loading ? <p role="status">Checking your account…</p> : user ? (
      <div className="onb-work-actions">
        <Link className="onb-btn onb-btn--primary" href={next}>Continue</Link>
        <Link className="onb-btn onb-btn--ghost" href="/settings">Account settings</Link>
        <button className="onb-btn onb-btn--quiet" type="button" onClick={() => void signOut()}>Sign out</button>
      </div>
    ) : (
      <>
      <div className="onb-auth-tabs" aria-label="Account access">
        <button type="button" aria-pressed={mode === "signin"} className={`onb-btn onb-btn--${mode === "signin" ? "primary" : "ghost"}`} disabled={busy} onClick={() => switchMode("signin")}>Sign in</button>
        <button type="button" aria-pressed={mode === "signup"} className={`onb-btn onb-btn--${mode === "signup" ? "primary" : "ghost"}`} disabled={busy} onClick={() => switchMode("signup")}>Create account</button>
      </div>
      <form className="onb-work-form" onSubmit={submit} key={mode}>
        <div><label className="onb-label" htmlFor="account-email">Email</label><input className="onb-field" id="account-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setPendingEmail(""); setNotice(""); setError(""); }} required /></div>
        <div><label className="onb-label" htmlFor="account-password">Password</label><input className="onb-field" id="account-password" name="password" type="password" minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} required /></div>
        {mode === "signup" && <p className="onb-help">Use at least 8 characters.</p>}
        <div className="onb-work-actions">
          <button className="onb-btn onb-btn--primary" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
          {mode === "signin" && <Link className="onb-btn onb-btn--ghost" href={passwordResetPath}>Forgot password?</Link>}
        </div>
      </form>
      {pendingEmail && <button className="onb-btn onb-btn--ghost" type="button" disabled={busy} onClick={() => void resendConfirmation()}>Resend confirmation email</button>}
      </>
    )}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="onb-error" role="alert">{error}</p>}
  </div></WorkspacePage>;
}
