// Onboarding domain types.
//
// The onboarding flow collects these five things, then hands them to
// /api/generate. Everything here is client-side state — the photo itself is
// deliberately NOT in this object (see store.ts).

export type OccasionId =
  | "everyday"
  | "work"
  | "first_date"
  | "dinner"
  | "wedding_guest"
  | "event"
  | "travel"
  | "job_interview"
  | "other";

export type StyleId =
  | "minimal"
  | "smart_casual"
  | "classic"
  | "relaxed"
  | "modern"
  | "trendy"
  | "elegant"
  | "streetwear"
  | "edgy";

export type CountryCode = "CA" | "US" | "JP" | "GB";

export type GenerationStatus =
  | "idle"
  | "generating"
  | "complete"
  | "error"
  | "limit_reached";

export interface OnboardingState {
  occasion: OccasionId | null;
  customOccasion: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  country: CountryCode;
  cityOrPostalCode: string;
  stylePreferences: StyleId[];
  avoidText: string;
  currentStep: number;
}

export const TOTAL_STEPS = 5;

export const DEFAULT_STATE: OnboardingState = {
  occasion: null,
  customOccasion: "",
  budgetMin: 200,
  budgetMax: 500,
  currency: "CAD",
  country: "CA",
  cityOrPostalCode: "",
  stylePreferences: [],
  avoidText: "",
  currentStep: 1,
};

export const BUDGET_FLOOR = 50;
export const BUDGET_CEILING = 1500;

export const OCCASIONS: {
  id: OccasionId;
  label: string;
  /** Free-text sent to the styling engine. */
  prompt: string;
  image: string;
}[] = [
  {
    id: "everyday",
    label: "Everyday",
    prompt: "everyday wear",
    image: "/landing/styled/everyday.jpg",
  },
  {
    id: "work",
    label: "Work",
    prompt: "the office",
    image: "/landing/styled/office.jpg",
  },
  {
    id: "first_date",
    label: "First date",
    prompt: "a first date",
    image: "/landing/occasions/first-date.jpg",
  },
  {
    id: "dinner",
    label: "Dinner",
    prompt: "dinner out",
    image: "/landing/occasions/dinner.jpg",
  },
  {
    id: "wedding_guest",
    label: "Wedding guest",
    prompt: "a wedding, as a guest",
    image: "/landing/onboarding/wedding-guest.jpg",
  },
  {
    id: "event",
    label: "Event",
    prompt: "an evening event",
    image: "/landing/occasions/event.jpg",
  },
  {
    id: "travel",
    label: "Travel",
    prompt: "travel and vacation",
    image: "/landing/occasions/vacation.jpg",
  },
  {
    id: "job_interview",
    label: "Job interview",
    prompt: "a job interview",
    image: "/landing/occasions/job-interview.jpg",
  },
  {
    id: "other",
    label: "Something else",
    prompt: "",
    image: "/landing/onboarding/other.jpg",
  },
];

export const STYLES: { id: StyleId; label: string; image: string }[] = [
  { id: "minimal", label: "Minimal", image: "/landing/styled/everyday.jpg" },
  {
    id: "smart_casual",
    label: "Smart casual",
    image: "/landing/hero/look-smart.jpg",
  },
  { id: "classic", label: "Classic", image: "/landing/steps/look-b.jpg" },
  { id: "relaxed", label: "Relaxed", image: "/landing/hero/look-casual.jpg" },
  { id: "modern", label: "Modern", image: "/landing/steps/look-main.jpg" },
  { id: "trendy", label: "Trendy", image: "/landing/onboarding/trendy.jpg" },
  { id: "elegant", label: "Elegant", image: "/landing/styled/date.jpg" },
  {
    id: "streetwear",
    label: "Streetwear",
    image: "/landing/onboarding/streetwear.jpg",
  },
  { id: "edgy", label: "Edgy", image: "/landing/onboarding/edgy.jpg" },
];

export const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
];

/**
 * Shown as examples of where products are sourced. These are NOT partnerships
 * — the copy alongside must never imply one (see the Affiliate Disclosure).
 */
export const RETAILERS_BY_COUNTRY: Record<CountryCode, string[]> = {
  CA: ["ZARA", "Aritzia", "H&M", "lululemon", "NIKE", "UNIQLO", "COS"],
  US: ["ZARA", "J.Crew", "H&M", "Everlane", "NIKE", "UNIQLO", "COS"],
  JP: ["UNIQLO", "MUJI", "ZARA", "BEAMS", "NIKE", "GU", "COS"],
  GB: ["ZARA", "M&S", "H&M", "ASOS", "NIKE", "UNIQLO", "COS"],
};

/** Resolves the occasion into the free text the styling engine reads. */
export function occasionText(state: OnboardingState): string {
  if (state.occasion === "other") return state.customOccasion.trim();
  return OCCASIONS.find((o) => o.id === state.occasion)?.prompt ?? "";
}

/** Style chips + avoid text become the engine's "desired look" description. */
export function desiredLookText(state: OnboardingState): string {
  const chosen = STYLES.filter((s) =>
    state.stylePreferences.includes(s.id),
  ).map((s) => s.label.toLowerCase());

  if (chosen.length === 0) return "well put together, true to how I already dress";
  return chosen.join(", ");
}

export function isStepValid(step: number, state: OnboardingState): boolean {
  switch (step) {
    case 1:
      return true; // photo validity is tracked outside this object
    case 2:
      return state.occasion === "other"
        ? state.customOccasion.trim().length > 1
        : state.occasion !== null;
    case 3:
      return (
        state.budgetMax > state.budgetMin &&
        state.budgetMin >= BUDGET_FLOOR &&
        state.budgetMax <= BUDGET_CEILING
      );
    case 4:
      return Boolean(state.country);
    case 5:
      return true; // optional by design
    default:
      return false;
  }
}
