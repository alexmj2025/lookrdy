"use client";

/**
 * Cookie consent state.
 *
 * Behaviour here follows the commitments in the Cookie Policy rather than a
 * generic banner: optional categories stay denied until the user allows them,
 * the choice is withdrawable at any time, and Global Privacy Control is
 * honoured where the browser sends it.
 *
 * "Advertising" is deliberately absent. The Cookie Policy states advertising
 * technologies are not used and would require fresh notice before being
 * introduced, so offering a dormant toggle would misrepresent the site.
 */

export const CONSENT_KEY = "lookrdy.consent";
export const CONSENT_VERSION = 1;

export type OptionalCategory = "preferences" | "analytics" | "affiliate";

export type ConsentCategories = Record<OptionalCategory, boolean>;

export type ConsentRecord = {
  version: number;
  decidedAt: string;
  /** True when the decision came from a Global Privacy Control signal. */
  viaGpc?: boolean;
  categories: ConsentCategories;
};

export const DENY_ALL: ConsentCategories = {
  preferences: false,
  analytics: false,
  affiliate: false,
};

export const ALLOW_ALL: ConsentCategories = {
  preferences: true,
  analytics: true,
  affiliate: true,
};

export const CATEGORY_COPY: {
  id: OptionalCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "preferences",
    label: "Preferences",
    description:
      "Remembers language, region, interface settings, and choices you ask us to retain.",
  },
  {
    id: "analytics",
    label: "Analytics and performance",
    description:
      "Helps us understand visits, feature use, errors, speed, and aggregated conversion funnels.",
  },
  {
    id: "affiliate",
    label: "Affiliate and attribution",
    description:
      "Records that you clicked a retailer link so a qualifying purchase can be attributed to Lookrdy. Blocking this never increases the price you pay.",
  },
];

/** Cached so track() can read consent synchronously on every call. */
let cached: ConsentRecord | null | undefined;

const listeners = new Set<(record: ConsentRecord | null) => void>();

function hasGpc(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  );
}

export function readConsent(): ConsentRecord | null {
  if (cached !== undefined) return cached;
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) {
      cached = null;
      return null;
    }
    const parsed = JSON.parse(raw) as ConsentRecord;
    // A version bump means the categories changed materially, so the old
    // decision no longer covers what we would be asking about.
    if (parsed?.version !== CONSENT_VERSION) {
      cached = null;
      return null;
    }
    cached = parsed;
    return parsed;
  } catch {
    cached = null;
    return null;
  }
}

export function writeConsent(
  categories: ConsentCategories,
  opts: { viaGpc?: boolean } = {},
): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    ...(opts.viaGpc ? { viaGpc: true } : {}),
    categories,
  };

  cached = record;
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    /* storage blocked — consent still applies for this page view */
  }
  for (const listener of listeners) listener(record);
  return record;
}

/** True only when the user has actively allowed this category. */
export function isAllowed(category: OptionalCategory): boolean {
  return readConsent()?.categories[category] === true;
}

export function subscribe(fn: (record: ConsentRecord | null) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Resolves what to do on first load: a Global Privacy Control signal is an
 * expressed choice, so record a denial rather than showing a banner.
 */
export function resolveInitialState():
  | { show: false; record: ConsentRecord }
  | { show: true } {
  const existing = readConsent();
  if (existing) return { show: false, record: existing };

  if (hasGpc()) {
    return { show: false, record: writeConsent(DENY_ALL, { viaGpc: true }) };
  }
  return { show: true };
}

/** Test/debug helper — clears the in-memory cache after external changes. */
export function resetCache() {
  cached = undefined;
}
