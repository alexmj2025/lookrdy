"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_STATE, type OnboardingState } from "./types";

/**
 * Onboarding state, persisted to sessionStorage so a refresh mid-flow doesn't
 * throw the user back to step 1.
 *
 * The PHOTO is deliberately excluded. It stays in the module-level variable in
 * src/lib/flowStore.ts — in memory, this tab only, never written to disk on
 * either side. That is a privacy commitment the Privacy Policy makes, so the
 * convenience of surviving a refresh does not override it: after a refresh the
 * user is returned to step 1 to re-pick their photo, and everything else they
 * typed is still there.
 */

const KEY = "lookrdy:onboarding";

export function readOnboarding(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    // Merge over defaults so a shape change in a later release can't leave a
    // half-populated object behind.
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<OnboardingState>) };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeOnboarding(state: OnboardingState) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage blocked — the flow still works for this page view */
  }
}

export function clearOnboarding() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}

/**
 * Reads on mount rather than during render: sessionStorage isn't available on
 * the server, and seeding state from it directly would produce a hydration
 * mismatch. `ready` tells the UI when the restored values are live.
 */
export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(readOnboarding());
    setReady(true);
  }, []);

  /**
   * Accepts a plain patch, or a function of the previous state. The functional
   * form matters for anything that derives its next value from the current one
   * — multi-select in particular, where two clicks inside one React batch
   * would otherwise both read the same stale array and the second would
   * discard the first.
   */
  const update = useCallback(
    (
      patch:
        | Partial<OnboardingState>
        | ((prev: OnboardingState) => Partial<OnboardingState>),
    ) => {
      setState((prev) => {
        const resolved = typeof patch === "function" ? patch(prev) : patch;
        const next = { ...prev, ...resolved };
        writeOnboarding(next);
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    clearOnboarding();
    setState(DEFAULT_STATE);
  }, []);

  return { state, update, reset, ready };
}
