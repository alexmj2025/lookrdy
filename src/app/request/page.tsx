"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/Wordmark";
import { track } from "@/lib/analytics/client";
import { setRequest, clearResult } from "@/lib/flowStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OCCASIONS = [
  "Company dinner",
  "Wedding",
  "Date",
  "Job interview",
  "Everyday",
  "Travel",
];

/** Editable default, pre-filled so the field is never a blank page. */
const SUGGESTED_LOOK =
  "Put together and modern, without looking like I tried too hard";

const LOOK_CHIPS = [
  "Minimal",
  "Sharp and tailored",
  "Relaxed",
  "All black",
  "Warm neutrals",
  "Classic",
  "A bit bold",
];

const CURRENCIES = ["CAD", "USD", "GBP", "EUR", "AUD", "JPY"];

export default function RequestPage() {
  const router = useRouter();
  const [occasion, setOccasion] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [desiredLook, setDesiredLook] = useState(SUGGESTED_LOOK);
  const [budget, setBudget] = useState("400");
  const [currency, setCurrency] = useState("CAD");
  const [location, setLocation] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [error, setError] = useState<string | null>(null);

  const effectiveOccasion = customOccasion.trim() || occasion;

  function addChip(chip: string) {
    setDesiredLook((prev) => {
      const base = prev.trim();
      if (base.toLowerCase().includes(chip.toLowerCase())) return base;
      if (!base || base === SUGGESTED_LOOK) return chip;
      return `${base}, ${chip.toLowerCase()}`;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const budgetNum = Number(budget);
    if (!effectiveOccasion) return setError("Pick an occasion, or describe your own.");
    if (!desiredLook.trim()) return setError("Tell us how you want to look.");
    if (!Number.isFinite(budgetNum) || budgetNum <= 0)
      return setError("Enter a budget above zero.");
    if (!location.trim())
      return setError("Enter your city so we only show retailers that ship to you.");

    setRequest({
      occasion: effectiveOccasion,
      desiredLook: desiredLook.trim(),
      budget: budgetNum,
      currency,
      location: location.trim(),
      exclusions: exclusions.trim(),
    });
    clearResult();
    track("request_completed", { occasion: effectiveOccasion, budget: budgetNum });
    router.push("/generating");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-10 md:pt-16">
        <p className="label">Step 2 of 3</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">
          What are you dressing for?
        </h1>

        <form onSubmit={submit} className="mt-12 space-y-12">
          {/* Occasion */}
          <fieldset>
            <legend className="label-ink">Occasion</legend>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {OCCASIONS.map((o) => {
                const active = occasion === o && !customOccasion.trim();
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setOccasion(o);
                      setCustomOccasion("");
                    }}
                    className={`min-h-[3.25rem] border px-3 py-3 text-[0.9375rem] transition-colors ${
                      active
                        ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                        : "hairline hover:border-[var(--color-ink)]"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            <input
              className="field mt-3"
              placeholder="Or describe your own occasion"
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              aria-label="Custom occasion"
            />
          </fieldset>

          {/* Desired look */}
          <fieldset>
            <legend className="label-ink">How do you want to look?</legend>
            <p className="mt-2 text-sm text-[var(--color-meta)]">
              We&rsquo;ve suggested a starting point — edit it however you like.
            </p>
            <textarea
              className="field mt-4 resize-none"
              rows={3}
              value={desiredLook}
              onChange={(e) => setDesiredLook(e.target.value)}
              aria-label="How you want to look"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {LOOK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="chip"
                  onClick={() => addChip(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Budget + location */}
          <div className="grid gap-8 sm:grid-cols-2">
            <fieldset>
              <legend className="label-ink">Total budget</legend>
              <p className="mt-2 text-sm text-[var(--color-meta)]">
                For the whole outfit, not per item.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  className="field"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  aria-label="Budget amount"
                />
                <Select
                  value={currency}
                  onValueChange={(value) => setCurrency(value ?? "CAD")}
                >
                  <SelectTrigger
                    aria-label="Currency"
                    className="field w-28 justify-between rounded-none focus-visible:ring-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c} className="rounded-none">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            <fieldset>
              <legend className="label-ink">Location</legend>
              <p className="mt-2 text-sm text-[var(--color-meta)]">
                Sets currency, climate, and which retailers can reach you.
              </p>
              <input
                className="field mt-4"
                placeholder="e.g. Toronto, Canada"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Location"
              />
            </fieldset>
          </div>

          {/* Exclusions */}
          <fieldset>
            <div className="flex items-baseline justify-between">
              <legend className="label-ink">Anything to avoid?</legend>
              <span className="label">Optional</span>
            </div>
            <input
              className="field mt-4"
              placeholder="e.g. no suits, nothing white, no sneakers"
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              aria-label="Exclusions"
            />
          </fieldset>

          {error && (
            <p className="border-l-2 border-[var(--color-ink)] pl-4 text-[0.9375rem]">
              {error}
            </p>
          )}

          <button type="submit" className="btn w-full sm:w-auto">
            Build my looks
          </button>
        </form>
      </main>
    </>
  );
}
