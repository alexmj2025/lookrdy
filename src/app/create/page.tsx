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
import {
  canGenerate,
  getCreditBalance,
  markLimitReached,
  spendCredit,
  syncFreeRemaining,
} from "@/lib/onboarding/credits";
import {
  COUNTRIES,
  desiredLookText,
  isStepValid,
  OCCASIONS,
  occasionText,
  STYLES,
  TOTAL_STEPS,
  type OccasionId,
  type StyleId,
} from "@/lib/onboarding/types";
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
    if (!canGenerate()) {
      markLimitReached();
      setPaywall(true);
      return;
    }

    const photo = getPhoto();
    if (!photo) {
      goTo(1);
      return;
    }

    // A paid credit is only spent once the free allowance is gone. The server
    // is still the authority on the free count; this is the client's mirror.
    const usingCredit = getCreditBalance() > 0 && !canFreeGenerate();
    if (usingCredit) spendCredit();

    const req: StyleRequest = {
      occasion: occasionText(state),
      desiredLook: desiredLookText(state),
      budget: state.budgetMax,
      currency: state.currency,
      location: [state.cityOrPostalCode, countryName(state.country)]
        .filter(Boolean)
        .join(", "),
      exclusions: state.avoidText,
    };

    setRequest(req);
    setGenerating(true);
    setError(null);
    trackOnboarding("generation_started", { occasion: req.occasion });

    try {
      const form = new FormData();
      form.set("occasion", req.occasion);
      form.set("desiredLook", req.desiredLook);
      form.set("budget", String(req.budget));
      form.set("currency", req.currency);
      form.set("location", req.location);
      form.set("exclusions", req.exclusions);
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
                Choose where you&rsquo;re going, or tell us your own.
              </p>

              <div className="onb-grid" style={{ marginTop: "1.75rem" }}>
                {OCCASIONS.map((o) => (
                  <SelectCard
                    key={o.id}
                    label={o.label}
                    image={o.image}
                    selected={state.occasion === o.id}
                    onToggle={() => {
                      update({ occasion: o.id as OccasionId });
                      trackOnboarding("occasion_selected", { occasion: o.id });
                    }}
                  />
                ))}
              </div>

              {state.occasion === "other" && (
                <div style={{ marginTop: "1.5rem", maxWidth: "30rem" }}>
                  <label className="onb-label" htmlFor="onb-custom">
                    Tell us what you&rsquo;re dressing for
                  </label>
                  <input
                    id="onb-custom"
                    className="onb-field"
                    autoFocus
                    value={state.customOccasion}
                    placeholder="e.g. a gallery opening, a christening"
                    onChange={(e) => update({ customOccasion: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onb-step">
            <div>
              <p className="onb-eyebrow">Step 3 of {TOTAL_STEPS}</p>
              <h1 className="onb-h1">Set your budget</h1>
              <p className="onb-lede">
                We&rsquo;ll build complete looks within your budget.
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
                Every look is a full outfit — top, bottom, shoes and any layers
                — priced together, so the number you set is the number you pay.
              </p>
              <ul className="onb-tips">
                <li className="onb-tip">
                  <span className="onb-tip__icon">
                    <Shirt size={15} />
                  </span>
                  <span>
                    <span className="onb-tip__title">Real products</span>
                    <span className="onb-tip__body">
                      From stores that ship to you
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
                  country={state.country}
                  cityOrPostalCode={state.cityOrPostalCode}
                  onCountry={(code) => {
                    update({ country: code });
                    trackOnboarding("country_selected", { country: code });
                  }}
                  onCity={(v) => update({ cityOrPostalCode: v })}
                />
              </div>
            </div>

            <aside className="onb-aside">
              <h2 className="onb-aside__title">Your city, your options</h2>
              <p className="onb-aside__body">
                Availability, pricing and sizing vary by location, so we search
                what&rsquo;s actually reachable from where you are. You can
                change this any time.
              </p>
            </aside>
          </div>
        )}

        {step === 5 && (
          <div className="onb-step onb-step--wide">
            <div>
              <p className="onb-eyebrow">Step 5 of {TOTAL_STEPS}</p>
              <h1 className="onb-h1">
                Your style <span className="onb-optional">Optional</span>
              </h1>
              <p className="onb-lede">
                Help us understand what feels like you. Choose as many as you
                like.
              </p>

              <div className="onb-grid" style={{ marginTop: "1.75rem" }}>
                {STYLES.map((s) => (
                  <SelectCard
                    key={s.id}
                    label={s.label}
                    image={s.image}
                    selected={state.stylePreferences.includes(s.id)}
                    onToggle={() => {
                      update((prev) => {
                        const has = prev.stylePreferences.includes(s.id);
                        const next = has
                          ? prev.stylePreferences.filter((x) => x !== s.id)
                          : [...prev.stylePreferences, s.id as StyleId];
                        trackOnboarding("style_selected", { styles: next });
                        return { stylePreferences: next };
                      });
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
                  placeholder="e.g. no skinny jeans, no bright colours, no leather"
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
        onPurchased={() => {
          setPaywall(false);
          void generate();
        }}
      />
    </>
  );
}

function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? "Canada";
}

/** Free allowance still available, per the client's mirror of the server count. */
function canFreeGenerate(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("lookrdy:free_remaining");
    return raw === null || Number(raw) > 0;
  } catch {
    return true;
  }
}
