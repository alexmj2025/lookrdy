"use client";

import Link from "next/link";
import { useState } from "react";
import "../onboarding.css";
import { WorkspacePage } from "@/components/onboarding/WorkspacePage";
import { useAuth, signOut } from "@/lib/onboarding/auth";
import { passwordResetPath } from "@/lib/onboarding/accountPaths";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [error, setError] = useState("");
  return <WorkspacePage>
    <h1 className="onb-h1">Settings</h1>
    {loading ? <p role="status">Checking your account…</p> : !user ? (
      <Link href="/account?next=/settings" className="onb-btn onb-btn--primary">Sign in to manage settings</Link>
    ) : <section className="onb-work-section">
      <h2 className="onb-aside__title">Sign-in details</h2>
      <p>{user.email}</p>
      <div className="onb-work-actions">
        <Link href={passwordResetPath} className="onb-btn onb-btn--ghost">Reset password by email</Link>
        <button className="onb-btn onb-btn--quiet" type="button" onClick={async () => {
          setError("");
          try { if ((await signOut()).error) throw new Error(); }
          catch { setError("Couldn’t sign out. Please try again."); }
        }}>Sign out</button>
      </div>
      {error && <p className="onb-error" role="alert">{error}</p>}
    </section>}
  </WorkspacePage>;
}
