"use client";

import { Check } from "./icons";

const LABELS = ["Photo", "Occasion", "Budget", "Location", "Style"];

/**
 * Segmented step indicator. The dots and connectors are decorative — the plain
 * "Step 2 of 5" sentence is what a screen reader announces, and the live
 * region means it's announced on change rather than silently.
 */
export function ProgressBar({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  return (
    <div className="onb-progress">
      <p className="onb-sr" aria-live="polite">
        Step {step} of {totalSteps}
      </p>

      {Array.from({ length: totalSteps }, (_, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "active" : "todo";
        return (
          <div key={n} style={{ display: "contents" }}>
            {i > 0 && (
              <span
                className="onb-progress__bar"
                data-filled={n <= step}
                aria-hidden="true"
              />
            )}
            <div className="onb-progress__step" data-state={state} aria-hidden="true">
              <span className="onb-progress__dot">
                {state === "done" ? <Check size={13} /> : n}
              </span>
              <span className="onb-progress__label">{LABELS[i]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
