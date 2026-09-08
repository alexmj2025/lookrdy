"use client";

import { Coins } from "./icons";
import { BUDGET_CEILING, BUDGET_FLOOR } from "@/lib/onboarding/types";

const STEP = 10;
const GAP = 25; // keep the handles from crossing or collapsing

// The Simons pilot catalog's base-outfit band is fixed at $200-450, so every
// preset lives inside it rather than the wider range a general budget slider
// would offer.
const PRESETS: { label: string; min: number; max: number }[] = [
  { label: "Full range", min: BUDGET_FLOOR, max: BUDGET_CEILING },
  { label: "$200 – $300", min: 200, max: 300 },
  { label: "$300 – $380", min: 300, max: 380 },
  { label: "$380 – $450", min: 380, max: BUDGET_CEILING },
];

const pct = (v: number) =>
  ((v - BUDGET_FLOOR) / (BUDGET_CEILING - BUDGET_FLOOR)) * 100;

export function BudgetRangeSlider({
  min,
  max,
  currency,
  onChange,
}: {
  min: number;
  max: number;
  currency: string;
  onChange: (next: { budgetMin: number; budgetMax: number }) => void;
}) {
  return (
    <div className="onb-budget">
      <p className="onb-budget__value">
        ${min} – ${max}
        <span>{currency}</span>
      </p>
      <p className="onb-budget__caption">Total budget for the full look.</p>

      <div className="onb-slider">
        <span className="onb-slider__track" aria-hidden="true" />
        <span
          className="onb-slider__fill"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
          aria-hidden="true"
        />

        <input
          type="range"
          min={BUDGET_FLOOR}
          max={BUDGET_CEILING}
          step={STEP}
          value={min}
          aria-label="Minimum budget"
          onChange={(e) =>
            onChange({
              budgetMin: Math.min(Number(e.target.value), max - GAP),
              budgetMax: max,
            })
          }
        />
        <input
          type="range"
          min={BUDGET_FLOOR}
          max={BUDGET_CEILING}
          step={STEP}
          value={max}
          aria-label="Maximum budget"
          onChange={(e) =>
            onChange({
              budgetMin: min,
              budgetMax: Math.max(Number(e.target.value), min + GAP),
            })
          }
        />
      </div>

      <div className="onb-slider__ends">
        <span>${BUDGET_FLOOR}</span>
        <span>${BUDGET_CEILING}+</span>
      </div>

      <div className="onb-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="onb-preset"
            aria-pressed={min === p.min && max === p.max}
            onClick={() => onChange({ budgetMin: p.min, budgetMax: p.max })}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="onb-note">
        <Coins />
        <span>
          <strong>
            This covers the complete outfit, not each item.
          </strong>
          <span>
            We&rsquo;ll find the best combination of real products inside your
            range.
          </span>
        </span>
      </div>
    </div>
  );
}
