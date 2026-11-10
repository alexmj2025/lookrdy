// Onboarding domain types.
//
// The onboarding flow collects an occasion, budget and optional exclusions, then hands them to
// /api/generate. Everything here is client-side state — the photo itself is
// deliberately NOT in this object (see store.ts).
//
// Shaped around the Simons pilot catalog (src/lib/simons): occasion is a
// closed 3-value enum, budget is clamped to the catalog's own $200-450 base
// band, and the catalog is fixed to Canada.

import { BASE_MAX, BASE_MIN } from "@/lib/simons/types";
import type { Occasion } from "@/lib/simons/types";

export interface OnboardingState {
  occasion: Occasion | null;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  avoidText: string;
  currentStep: number;
}

export const TOTAL_STEPS = 3;

export const DEFAULT_STATE: OnboardingState = {
  occasion: null,
  budgetMin: BASE_MIN,
  budgetMax: BASE_MAX,
  currency: "CAD",
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
    default:
      return false;
  }
}
