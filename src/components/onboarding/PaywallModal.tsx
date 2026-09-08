"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useState } from "react";
import {
  CREDIT_PACKS,
  type CreditPack,
  isAuthenticated,
  mockPurchase,
  mockSignIn,
} from "@/lib/onboarding/credits";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { Sparkle } from "./icons";

/**
 * Shown when a generation is attempted with no free generations and no
 * credits left.
 *
 * Two stages: create an account, then choose a pack. Both are mocked —
 * BACKEND BOUNDARY markers are in src/lib/onboarding/credits.ts. The Dialog
 * is mounted only while open because Base UI otherwise holds the popup in the
 * DOM waiting on an exit animation, leaving an invisible backdrop that eats
 * every click.
 */
export function PaywallModal({
  open,
  onClose,
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  onPurchased: () => void;
}) {
  const [stage, setStage] = useState<"signup" | "packs">("signup");
  const [selected, setSelected] = useState<string>(CREDIT_PACKS[1].id);

  useEffect(() => {
    if (!open) return;
    trackOnboarding("paywall_viewed");
    setStage(isAuthenticated() ? "packs" : "signup");
  }, [open]);

  const buy = (pack: CreditPack) => {
    trackOnboarding("credits_selected", { pack: pack.id, credits: pack.credits });
    mockPurchase(pack); // BACKEND BOUNDARY: Stripe checkout session goes here.
    onPurchased();
  };

  if (!open) return null;

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="onb-modal-backdrop" />
        <Dialog.Popup className="onb-modal">
          {stage === "signup" ? (
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
                You&rsquo;ve used your 3 free style generations. Create an
                account to save your looks and get more style credits.
              </Dialog.Description>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginTop: "1.75rem",
                }}
              >
                <button
                  type="button"
                  className="onb-btn onb-btn--primary"
                  style={{ flex: "1 1 12rem" }}
                  onClick={() => {
                    trackOnboarding("signup_started");
                    mockSignIn(); // BACKEND BOUNDARY: Supabase Auth sign-up.
                    setStage("packs");
                  }}
                >
                  Create account
                </button>
                <button type="button" className="onb-btn onb-btn--ghost" onClick={onClose}>
                  Maybe later
                </button>
              </div>
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
                Choose your style credits
              </Dialog.Title>
              <Dialog.Description
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "#6b6a66",
                }}
              >
                1 style credit = 1 new set of 3 personalized looks.
              </Dialog.Description>

              <div className="onb-packs">
                {CREDIT_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    className="onb-pack"
                    aria-pressed={selected === pack.id}
                    onClick={() => setSelected(pack.id)}
                  >
                    <span className="onb-pack__credits">
                      {pack.credits} style credits
                      {pack.bestValue && (
                        <span className="onb-pack__flag">Best value</span>
                      )}
                    </span>
                    <span className="onb-pack__price">
                      ${pack.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="onb-btn onb-btn--primary"
                  style={{ flex: "1 1 12rem" }}
                  onClick={() =>
                    buy(CREDIT_PACKS.find((p) => p.id === selected) ?? CREDIT_PACKS[1])
                  }
                >
                  <Sparkle size={15} /> Continue
                </button>
                {/* Every stage needs a visible way out — leaving only Escape
                    and a backdrop click strands anyone who reached the packs
                    step and changed their mind. */}
                <button type="button" className="onb-btn onb-btn--ghost" onClick={onClose}>
                  Maybe later
                </button>
              </div>

              <p
                style={{
                  margin: "0.875rem 0 0",
                  fontSize: "0.75rem",
                  color: "#6b6a66",
                  textAlign: "center",
                }}
              >
                Payments aren&rsquo;t live yet — this is a preview of the
                upgrade flow.
              </p>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CreditCounter({
  freeRemaining,
  credits,
}: {
  freeRemaining: number;
  credits: number;
}) {
  if (credits > 0) {
    return (
      <span className="onb-credits">
        <Sparkle size={14} />
        <strong>{credits}</strong> style credits
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
