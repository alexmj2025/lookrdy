// Onboarding domain types.
//
// The onboarding flow collects these five things, then hands them to
// /api/generate. Everything here is client-side state — the photo itself is
// deliberately NOT in this object (see store.ts).
//
// Shaped around the Simons pilot catalog (src/lib/simons): occasion is a
// closed 3-value enum, budget is clamped to the catalog's own $200-450 base
// band, location is fixed to Canada, and "style" is the catalog's own
// Safe/Polished/Bold classification rather than a free-form aesthetic list —
// the catalog has no "streetwear" or "minimal" dimension to match against.

import { BASE_MAX, BASE_MIN } from "@/lib/simons/types";
import type { LookRole, Occasion } from "@/lib/simons/types";

export type StyleId = LookRole;

export type CountryCode = "CA";

export type GenerationStatus =
  | "idle"
  | "generating"
  | "complete"
  | "error"
  | "limit_reached";

export interface OnboardingState {
  occasion: Occasion | null;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  country: CountryCode;
  cityOrPostalCode: string;
  /** At most one — Safe/Polished/Bold is a single preferred direction, not a set. */
  stylePreference: StyleId | null;
  avoidText: string;
  currentStep: number;
}

export const TOTAL_STEPS = 5;

export const DEFAULT_STATE: OnboardingState = {
  occasion: null,
  budgetMin: BASE_MIN,
  budgetMax: BASE_MAX,
  currency: "CAD",
  country: "CA",
  cityOrPostalCode: "",
  stylePreference: null,
  avoidText: "",
  currentStep: 1,
};

export const BUDGET_FLOOR = BASE_MIN;
export const BUDGET_CEILING = BASE_MAX;

export const OCCASIONS: { id: Occasion; label: string; image: string }[] = [
  {
    id: "company_dinner",
    label: "Company dinner",
    image: "/landing/styled/office.jpg",
  },
  {
    id: "date_upscale_dinner",
    label: "Date / upscale dinner",
    image: "/landing/occasions/dinner.jpg",
  },
  {
    id: "everyday_upgrade",
    label: "Everyday upgrade",
    image: "/landing/styled/everyday.jpg",
  },
];

export const STYLES: { id: StyleId; label: string; blurb: string; image: string }[] = [
  {
    id: "Safe",
    label: "Safe",
    blurb: "Neutral, nothing to second-guess",
    image: "/landing/styled/everyday.jpg",
  },
  {
    id: "Polished",
    label: "Polished",
    blurb: "A little more colour or texture",
    image: "/landing/hero/look-smart.jpg",
  },
  {
    id: "Bold",
    label: "Bold",
    blurb: "A statement piece, kept in check",
    image: "/landing/steps/look-b.jpg",
  },
];

export function isStepValid(step: number, state: OnboardingState): boolean {
  switch (step) {
    case 1:
      return true; // photo validity is tracked outside this object
    case 2:
      return state.occasion !== null;
    case 3:
      return (
        state.budgetMax > state.budgetMin &&
        state.budgetMin >= BUDGET_FLOOR &&
        state.budgetMax <= BUDGET_CEILING
      );
    case 4:
      return true; // location is fixed to Canada — nothing to validate
    case 5:
      return true; // optional by design
    default:
      return false;
  }
}
