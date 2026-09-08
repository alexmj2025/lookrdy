"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../onboarding.css";

import { Logo } from "@/components/Logo";
import { LookCard } from "@/components/onboarding/LookCard";
import {
  CreditCounter,
  PaywallModal,
} from "@/components/onboarding/PaywallModal";
import { ArrowRight } from "@/components/onboarding/icons";
import { getResult } from "@/lib/flowStore";
import { useAuth, signOut } from "@/lib/onboarding/auth";
import { canGenerate, getFreeRemaining } from "@/lib/onboarding/credits";
import type { GenerationResult } from "@/lib/types";

export default function LooksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [result, setResultState] = useState<GenerationResult | null>(null);
  const [freeRemaining, setFreeRemaining] = useState(0);
  const [paywall, setPaywall] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getResult().then((r) => {
      if (cancelled) return;
      if (!r) {
        router.replace("/create");
        return;
      }
      setResultState(r);
      setFreeRemaining(getFreeRemaining());
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!result) return <div className="onb" style={{ minHeight: "100dvh" }} />;

  return (
    <>
      <div className="onb">
        <div className="onb-shell">
          <header className="onb-topbar">
            <Link href="/" className="onb-topbar__mark" aria-label="Lookrdy home">
              <Logo height={22} priority />
            </Link>
            <span />
            <div
              className="onb-topbar__end"
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <CreditCounter authenticated={!!user} freeRemaining={freeRemaining} />
              {user && (
                <button
                  type="button"
                  className="onb-btn onb-btn--quiet"
                  onClick={() => void signOut()}
                >
                  Sign out
                </button>
              )}
            </div>
          </header>

          <div className="onb-panel">
            <div className="onb-results__head">
              <div>
                <p className="onb-eyebrow">Your looks are ready</p>
                <h1 className="onb-h1">Three directions, made for you.</h1>
                <p className="onb-lede">
                  Open any look to see the full outfit and the real products
                  behind it.
                </p>
              </div>

              <button
                type="button"
                className="onb-btn onb-btn--ghost"
                onClick={() => {
                  if (!canGenerate(!!user)) {
                    setPaywall(true);
                    return;
                  }
                  router.push("/create");
                }}
              >
                Generate new looks <ArrowRight size={15} />
              </button>
            </div>

            <div className="onb-looks">
              {result.looks.map((look, i) => (
                <LookCard
                  key={look.id}
                  look={look}
                  index={i}
                  budgetMax={result.request.budget}
                  currency={result.request.currency}
                  country="Canada"
                />
              ))}
            </div>

            <p
              className="onb-help"
              style={{ marginTop: "1.75rem", maxWidth: "60ch" }}
            >
              Images are AI visualizations, not photographs of the garments. Fit
              isn&rsquo;t guaranteed. Lookrdy is not officially affiliated with
              Simons — price, size and availability are confirmed on
              Simons.ca before you buy.
            </p>
          </div>
        </div>
      </div>

      <PaywallModal
        open={paywall}
        onClose={() => setPaywall(false)}
        onSignedIn={() => {
          setPaywall(false);
          router.push("/create");
        }}
      />
    </>
  );
}
