"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/lib/onboarding/auth";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { Sparkle } from "./icons";

/**
 * Shown when a generation is attempted with no free generations left and no
 * one signed in.
 *
 * Real Supabase Auth (email + password) — there is no payment tier yet, so
 * signing up is the whole story: once authenticated, /api/generate no
 * longer applies the free cap at all (see src/lib/session.ts /
 * src/app/api/generate/route.ts), so there's no second "buy credits" stage
 * to show here. The Dialog is mounted only while open because Base UI
 * otherwise holds the popup in the DOM waiting on an exit animation, leaving
 * an invisible backdrop that eats every click.
 */
export function PaywallModal({
  open,
  onClose,
  onSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignedIn: () => void;
}) {
  const [mode, setMode] = useState<"sign_up" | "sign_in">("sign_up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (open) trackOnboarding("paywall_viewed");
  }, [open]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setError(null);
      setCheckEmail(false);
      setBusy(false);
      setMode("sign_up");
    }
  }, [open]);

  if (!open) return null;

  async function submit() {
    setBusy(true);
    setError(null);

    if (mode === "sign_up") {
      trackOnboarding("signup_started");
      const { data, error: err } = await signUpWithEmail(email, password);
      setBusy(false);
      if (err) {
        setError(err.message);
        return;
      }
      // A Supabase project with email confirmation on returns a user with no
      // active session yet — tell the user to check their inbox rather than
      // silently doing nothing.
      if (data.user && !data.session) {
        setCheckEmail(true);
        return;
      }
      onSignedIn();
      return;
    }

    const { error: err } = await signInWithEmail(email, password);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSignedIn();
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="onb-modal-backdrop" />
        <Dialog.Popup className="onb-modal">
          {checkEmail ? (
            <>
              <Dialog.Title
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.375rem",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                Check your inbox
              </Dialog.Title>
              <Dialog.Description
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "#6b6a66",
                }}
              >
                We sent a confirmation link to {email}. Once you confirm,
                you&rsquo;re signed in and free to keep generating looks.
              </Dialog.Description>
              <button
                type="button"
                className="onb-btn onb-btn--ghost"
                style={{ marginTop: "1.5rem", width: "100%" }}
                onClick={onClose}
              >
                Close
              </button>
            </>
          ) : (
            <>
              <Dialog.Title
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.375rem",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                Keep creating your looks
              </Dialog.Title>
              <Dialog.Description
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "#6b6a66",
                }}
              >
                {mode === "sign_up"
                  ? "You’ve used your 3 free style generations. Create an account for unlimited looks."
                  : "Sign in to keep generating looks."}
              </Dialog.Description>

              <form
                style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
              >
                <div>
                  <label className="onb-label" htmlFor="onb-email">
                    Email
                  </label>
                  <input
                    id="onb-email"
                    className="onb-field"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="onb-label" htmlFor="onb-password">
                    Password
                  </label>
                  <input
                    id="onb-password"
                    className="onb-field"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {mode === "sign_up" && (
                    <p className="onb-help">At least 8 characters.</p>
                  )}
                </div>

                {error && <p className="onb-error" style={{ marginTop: 0 }}>{error}</p>}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button
                    type="submit"
                    className="onb-btn onb-btn--primary"
                    style={{ flex: "1 1 12rem" }}
                    disabled={busy}
                  >
                    <Sparkle size={15} />
                    {busy
                      ? "Please wait…"
                      : mode === "sign_up"
                        ? "Create account"
                        : "Sign in"}
                  </button>
                  <button
                    type="button"
                    className="onb-btn onb-btn--ghost"
                    onClick={onClose}
                  >
                    Maybe later
                  </button>
                </div>
              </form>

              <button
                type="button"
                className="onb-btn onb-btn--quiet"
                style={{ marginTop: "0.75rem" }}
                onClick={() => {
                  setMode((m) => (m === "sign_up" ? "sign_in" : "sign_up"));
                  setError(null);
                }}
              >
                {mode === "sign_up"
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CreditCounter({
  authenticated,
  freeRemaining,
}: {
  authenticated: boolean;
  freeRemaining: number;
}) {
  if (authenticated) {
    return (
      <span className="onb-credits">
        <Sparkle size={14} />
        Signed in · unlimited looks
      </span>
    );
  }
  return (
    <span className="onb-credits">
      <Sparkle size={14} />
      <strong>{freeRemaining}</strong> free{" "}
      {freeRemaining === 1 ? "generation" : "generations"} left
    </span>
  );
}
