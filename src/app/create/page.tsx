"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../onboarding.css";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { PhotoUploader } from "@/components/onboarding/PhotoUploader";
import { SelectCard } from "@/components/onboarding/SelectCard";
import { BudgetRangeSlider } from "@/components/onboarding/BudgetRangeSlider";
import { LoadingGenerator } from "@/components/onboarding/LoadingGenerator";
import { ExampleLooks } from "@/components/onboarding/ExampleLooks";
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
import { isStepValid, OCCASIONS, TOTAL_STEPS } from "@/lib/onboarding/types";
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
  const [needsAccount, setNeedsAccount] = useState(false);
  const submitting = useRef(false);

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
    if (submitting.current) return;
    const photo = getPhoto();
    if (!photo) {
      goTo(1);
      return;
    }
    if (!state.occasion) {
      goTo(2);
      return;
    }
    if (!isStepValid(TOTAL_STEPS, state)) return;

    const occasionLabel =
      OCCASIONS.find((o) => o.id === state.occasion)?.label ?? "";

    const req: StyleRequest = {
      occasion: occasionLabel,
      desiredLook: "",
      budget: state.budgetMax,
      currency: state.currency,
      location: "Canada",
      exclusions: state.avoidText,
    };

    setRequest(req);
    submitting.current = true;
    setGenerating(true);
    setError(null);
    setNeedsAccount(false);
    trackOnboarding("generation_started", { occasion: state.occasion });

    try {
      const form = new FormData();
      form.set("occasion", state.occasion);
      form.set("budgetMin", String(state.budgetMin));
      form.set("budgetMax", String(state.budgetMax));
      form.set("avoidText", state.avoidText);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data = (await res.json()) as GenerationResult | { error: string; message: string };

      if ("error" in data) {
        setGenerating(false);
        setNeedsAccount(data.error === "account_required");
        setError(data.message);
        return;
      }

      trackOnboarding("generation_completed", { looks: data.looks.length });

      await setResult(data);
      setDone(true);
      router.push("/looks");
    } catch {
      setGenerating(false);
      setError("Something went wrong while building your looks. Please try again.");
    } finally { submitting.current = false; }
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
      <OnboardingShell
        step={step}
        totalSteps={TOTAL_STEPS}
      >
        {step === 1 && <div className="onb-work-actions onb-source-switch" aria-label="Choose where to find clothes">
          <span className="onb-tag onb-tag--good">Shop Simons</span>
          <Link className="onb-btn onb-btn--ghost" href="/wardrobe">Style clothes I own</Link>
          <Link className="onb-btn onb-btn--quiet" href="/saved">My looks</Link>
        </div>}
        {step === 1 && <ExampleLooks />}
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
              <details style={{ marginTop: "1.25rem" }}>
                <summary className="onb-label" style={{ cursor: "pointer" }}>Anything to avoid? (optional)</summary>
                <label htmlFor="onb-avoid" className="onb-sr">Clothing preferences to avoid</label>
                <input
                  id="onb-avoid"
                  className="onb-field"
                  value={state.avoidText}
                  placeholder="e.g. no bright colours, no stripes"
                  onChange={(e) => update({ avoidText: e.target.value })}
                />
              </details>
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

        {error && <p className="onb-error" role="alert">{error}</p>}
        {needsAccount && <div className="onb-work-actions">
          <Link className="onb-btn onb-btn--primary" href="/account?next=/create">Create account or sign in</Link>
        </div>}

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
              disabled={!stepValid}
              onClick={() => void generate()}
            >
              Find my outfits <ArrowRight size={15} />
            </button>
          )}
        </div>
      </OnboardingShell>

  );
}
