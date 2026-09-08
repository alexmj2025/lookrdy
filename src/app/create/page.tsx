"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../onboarding.css";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { PhotoUploader } from "@/components/onboarding/PhotoUploader";
import { SelectCard } from "@/components/onboarding/SelectCard";
import { BudgetRangeSlider } from "@/components/onboarding/BudgetRangeSlider";
import { CountrySelector } from "@/components/onboarding/CountrySelector";
import { LoadingGenerator } from "@/components/onboarding/LoadingGenerator";
import { PaywallModal } from "@/components/onboarding/PaywallModal";
import {
  ArrowLeft,
  ArrowRight,
  NoFilter,
  People,
  Person,
  Shirt,
  Stand,
  Sun,
} from "@/components/onboarding/icons";

import { useOnboarding } from "@/lib/onboarding/store";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { useAuth } from "@/lib/onboarding/auth";
import {
  canGenerate,
  markLimitReached,
  syncFreeRemaining,
} from "@/lib/onboarding/credits";
import { isStepValid, OCCASIONS, STYLES, TOTAL_STEPS } from "@/lib/onboarding/types";
import type { LookRole, Occasion } from "@/lib/simons/types";
import { clearPhoto, getPhoto, setPhoto, setRequest, setResult } from "@/lib/flowStore";
import type { GenerationResult, StyleRequest } from "@/lib/types";

const PHOTO_TIPS = [
  { icon: <Person />, title: "Full body visible", body: "Head to toe in the frame" },
  { icon: <Sun />, title: "Good lighting", body: "Natural light works best" },
  { icon: <Stand />, title: "Stand naturally", body: "Relaxed and facing forward" },
  { icon: <Shirt />, title: "Everyday clothing", body: "Fitted or normal fit" },
  { icon: <NoFilter />, title: "No heavy filters", body: "Show your real look" },
  { icon: <People />, title: "One person only", body: "No one else in frame" },
];

export default function CreatePage() {
  const router = useRouter();
  const { state, update, ready } = useOnboarding();
  const { user } = useAuth();

  const [preview, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);

  const step = state.currentStep;

  useEffect(() => {
    trackOnboarding("onboarding_started");
  }, []);

  // The photo lives in memory only, so a refresh legitimately loses it. If
  // the user lands past step 1 without one, send them back rather than let
  // them reach the end and fail at generation.
  useEffect(() => {
    if (!ready) return;
    const existing = getPhoto();
    if (existing) setPreviewUrl(existing.preview);
    else if (state.currentStep > 1) update({ currentStep: 1 });
  }, [ready, state.currentStep, update]);

  if (!ready) return <div className="onb" style={{ minHeight: "100dvh" }} />;

  const goTo = (next: number) => {
    update({ currentStep: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepValid = step === 1 ? preview !== null : isStepValid(step, state);

  async function generate() {
    // Signed-in users bypass the free cap entirely — the server enforces
    // this too, but checking here avoids sending a doomed request.
    if (!canGenerate(!!user)) {
      markLimitReached();
      setPaywall(true);
      return;
    }

    const photo = getPhoto();
    if (!photo) {
      goTo(1);
      return;
    }

    const occasionLabel =
      OCCASIONS.find((o) => o.id === state.occasion)?.label ?? "";

    const req: StyleRequest = {
      occasion: occasionLabel,
      desiredLook: state.stylePreference ?? "",
      budget: state.budgetMax,
      currency: state.currency,
      location: [state.cityOrPostalCode, "Canada"].filter(Boolean).join(", "),
      exclusions: state.avoidText,
    };

    setRequest(req);
    setGenerating(true);
    setError(null);
    trackOnboarding("generation_started", { occasion: state.occasion });

    try {
      const form = new FormData();
      form.set("occasion", state.occasion as Occasion);
      form.set("budgetMin", String(state.budgetMin));
      form.set("budgetMax", String(state.budgetMax));
      form.set("avoidText", state.avoidText);
      if (state.stylePreference) form.set("stylePreference", state.stylePreference);
      form.set("photo", photo.file);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data = (await res.json()) as GenerationResult | { error: string; message: string };

      if ("error" in data) {
        if (data.error === "limit_reached") {
          markLimitReached();
          setGenerating(false);
          setPaywall(true);
          return;
        }
        setGenerating(false);
        setError(data.message);
        return;
      }

      syncFreeRemaining(data.generationsUsed, data.generationsAllowed);
      trackOnboarding("free_generation_used", {
        remaining: data.generationsAllowed - data.generationsUsed,
      });
      trackOnboarding("generation_completed", { looks: data.looks.length });

      setResult(data);
      setDone(true);
      // Let the ring land on 100% before the route changes.
      setTimeout(() => router.push("/looks"), 700);
    } catch {
      setGenerating(false);
      setError("Something went wrong while building your looks. Please try again.");
    }
  }

  if (generating) {
    return (
      <div className="onb">
        <div className="onb-shell">
          <div className="onb-panel">
            <LoadingGenerator done={done} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <OnboardingShell
        step={step}
        totalSteps={TOTAL_STEPS}
        onSkip={step === 5 ? () => void generate() : undefined}
      >
        {step === 1 && (
          <div className="onb-step">
            <div>
              <p className="onb-eyebrow">Step 1 of {TOTAL_STEPS}</p>
              <h1 className="onb-h1">Upload a photo</h1>
              <p className="onb-lede">
                A clear full-body photo helps us create better, more
                personalized looks.
              </p>
              <div style={{ marginTop: "1.75rem" }}>
                <PhotoUploader
                  preview={preview}
                  onSelect={(file, url) => {
                    setPhoto(file, url);
                    setPreviewUrl(url);
                    trackOnboarding("photo_uploaded", { bytes: file.size });
                  }}
                  onRemove={() => {
                    clearPhoto();
                    setPreviewUrl(null);
                  }}
                />
              </div>
            </div>

            <aside className="onb-aside">
              <h2 className="onb-aside__title">For the best results</h2>
              <ul className="onb-tips">
                {PHOTO_TIPS.map((t) => (
                  <li className="onb-tip" key={t.title}>
                    <span className="onb-tip__icon">{t.icon}</span>
                    <span>
                      <span className="onb-tip__title">{t.title}</span>
                      <span className="onb-tip__body">{t.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}

        {step === 2 && (
          <div className="onb-step onb-step--wide">
            <div>
              <p className="onb-eyebrow">Step 2 of {TOTAL_STEPS}</p>
              <h1 className="onb-h1">What&rsquo;s the occasion?</h1>
              <p className="onb-lede">
                We currently build looks for these three — more are coming.
              </p>

              <div className="onb-grid" style={{ marginTop: "1.75rem" }}>
                {OCCASIONS.map((o) => (
                  <SelectCard
                    key={o.id}
                    label={o.label}
                    image={o.image}
                    selected={state.occasion === o.id}
                    onToggle={() => {
                      update({ occasion: o.id });
                      trackOnboarding("occasion_selected", { occasion: o.id });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onb-step">
            <div>
              <p className="onb-eyebrow">Step 3 of {TOTAL_STEPS}</p>
              <h1 className="onb-h1">Set your budget</h1>
              <p className="onb-lede">
                Every look is a complete outfit priced between $200 and $450.
              </p>
              <div style={{ marginTop: "1.75rem" }}>
                <BudgetRangeSlider
                  min={state.budgetMin}
                  max={state.budgetMax}
                  currency={state.currency}
                  onChange={(next) => {
                    update(next);
                    trackOnboarding("budget_selected", next);
                  }}
                />
              </div>
            </div>

            <aside className="onb-aside">
              <h2 className="onb-aside__title">A complete look, within budget</h2>
              <p className="onb-aside__body">
                Every look is a full outfit — top, bottom and shoes — priced
                together. Optional layers, like a blazer or coat, are shown
                separately so this number never moves without you choosing it.
              </p>
              <ul className="onb-tips">
                <li className="onb-tip">
                  <span className="onb-tip__icon">
                    <Shirt size={15} />
                  </span>
                  <span>
                    <span className="onb-tip__title">Real products</span>
                    <span className="onb-tip__body">
                      Sourced from Simons.ca
                    </span>
                  </span>
                </li>
                <li className="onb-tip">
                  <span className="onb-tip__icon">
                    <Person size={15} />
                  </span>
                  <span>
                    <span className="onb-tip__title">Nothing hidden</span>
                    <span className="onb-tip__body">
                      Totals shown before you click out
                    </span>
                  </span>
                </li>
              </ul>
            </aside>
          </div>
        )}

        {step === 4 && (
          <div className="onb-step">
            <div>
              <p className="onb-eyebrow">Step 4 of {TOTAL_STEPS}</p>
              <h1 className="onb-h1">Where are you shopping?</h1>
              <p className="onb-lede">
                We&rsquo;ll prioritize products available in your region.
              </p>
              <div style={{ marginTop: "1.75rem" }}>
                <CountrySelector
                  cityOrPostalCode={state.cityOrPostalCode}
                  onCity={(v) => update({ cityOrPostalCode: v })}
                />
              </div>
            </div>

            <aside className="onb-aside">
              <h2 className="onb-aside__title">Your city, your options</h2>
              <p className="onb-aside__body">
                Availability, pricing and sizing vary by location. As we add
                retailers, we&rsquo;ll use this to prioritize what&rsquo;s
                reachable from where you are.
              </p>
            </aside>
          </div>
        )}

        {step === 5 && (
          <div className="onb-step onb-step--wide">
            <div>
              <p className="onb-eyebrow">Step 5 of {TOTAL_STEPS}</p>
              <h1 className="onb-h1">
                Pick a direction <span className="onb-optional">Optional</span>
              </h1>
              <p className="onb-lede">
                We&rsquo;ll always show a Safe, Polished and Bold option where
                the catalog supports it — pick one to see it recommended first.
              </p>

              <div className="onb-grid" style={{ marginTop: "1.75rem" }}>
                {STYLES.map((s) => (
                  <SelectCard
                    key={s.id}
                    label={`${s.label} — ${s.blurb}`}
                    image={s.image}
                    selected={state.stylePreference === s.id}
                    onToggle={() => {
                      const next = state.stylePreference === s.id ? null : s.id;
                      update({ stylePreference: next });
                      trackOnboarding("style_selected", { style: next });
                    }}
                  />
                ))}
              </div>

              <div style={{ marginTop: "1.75rem", maxWidth: "34rem" }}>
                <label className="onb-label" htmlFor="onb-avoid">
                  Anything to avoid?{" "}
                  <span style={{ fontWeight: 400, color: "var(--muted)" }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="onb-avoid"
                  className="onb-field"
                  value={state.avoidText}
                  placeholder="e.g. no bright colours, no stripes"
                  onChange={(e) => update({ avoidText: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="onb-error">{error}</p>}

        <div className="onb-footer">
          {step > 1 ? (
            <button
              type="button"
              className="onb-btn onb-btn--ghost"
              onClick={() => goTo(step - 1)}
            >
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              className="onb-btn onb-btn--primary"
              disabled={!stepValid}
              onClick={() => goTo(step + 1)}
            >
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="onb-btn onb-btn--primary"
              onClick={() => void generate()}
            >
              Generate my looks <ArrowRight size={15} />
            </button>
          )}
        </div>
      </OnboardingShell>

      <PaywallModal
        open={paywall}
        onClose={() => setPaywall(false)}
        onSignedIn={() => {
          setPaywall(false);
          void generate();
        }}
      />
    </>
  );
}
