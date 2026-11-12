"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../onboarding.css";

import { Logo } from "@/components/Logo";
import { LookCard } from "@/components/onboarding/LookCard";
import { ArrowRight } from "@/components/onboarding/icons";
import { getResult, hasPhoto } from "@/lib/flowStore";
import { requestPreview } from "@/lib/onboarding/requestPreview";
import { useAuth, signOut } from "@/lib/onboarding/auth";
import type { GenerationResult } from "@/lib/types";

export default function LooksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [result, setResultState] = useState<GenerationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getResult().then((r) => {
      if (cancelled) return;
      if (!r) {
        router.replace("/create");
        return;
      }
      setResultState(r);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const refresh = () => { void getResult().then((r) => { if (r) setResultState(r); }); };
    window.addEventListener("lookrdy:result", refresh);
    return () => window.removeEventListener("lookrdy:result", refresh);
  }, []);

  if (!result) return <div className="onb" style={{ minHeight: "100dvh" }} />;

  return (
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
              <Link className="onb-btn onb-btn--quiet" href="/saved">My looks</Link>
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
                <h1 className="onb-h1">{result.looks.length} directions, made for you.</h1>
                <p className="onb-lede">
                  Open any look to shop the selected items or request a preview on your photo. Browsing the lists uses no image credits.
                </p>
              </div>

              <button
                type="button"
                className="onb-btn onb-btn--ghost"
                onClick={() => router.push("/create")}
              >
                Find new outfits <ArrowRight size={15} />
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
                  onPreview={!look.imageUrl && (!look.previewNeedsAccount || user) && result.previewRequest && hasPhoto()
                    ? () => void requestPreview(result, look) : undefined}
                  previewBusy={result.looks.some((item) => item.previewStatus === "pending")}
                />
              ))}
            </div>
            {!user && !result.example && <div className="onb-work-section">
              <h2 className="onb-aside__title">Keep your favourite looks</h2>
              <p className="onb-help">Create an account to save outfits and continue after your first try.</p>
              <div className="onb-work-actions">
                <Link className="onb-btn onb-btn--primary" href="/account?next=/looks">Create account or sign in</Link>
                <Link className="onb-btn onb-btn--ghost" href="/wardrobe">Try my wardrobe</Link>
              </div>
            </div>}

            <p
              className="onb-help"
              style={{ marginTop: "1.75rem", maxWidth: "60ch" }}
            >
              Images are AI visualizations of a style direction, not
              photographs of any product. Each look links to{" "}
              <strong>similar options</strong> you can buy — not the exact
              garments shown — and fit isn&rsquo;t guaranteed. Lookrdy is not
              officially affiliated with Simons; confirm price, colour, size
              and availability on Simons.ca before you buy.
            </p>
          </div>
        </div>
      </div>

  );
}
