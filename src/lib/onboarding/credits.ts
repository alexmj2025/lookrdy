"use client";

/**
 * Free generations, and (dormant) paid credits.
 *
 * BACKEND BOUNDARY. The authoritative free-generation count already lives
 * server-side: /api/generate reads it from the `generations` table keyed by an
 * httpOnly session cookie (src/lib/session.ts) and returns
 * `generationsUsed` / `generationsAllowed` on every success, or
 * `error: "limit_reached"` once the allowance is gone. This module holds only
 * the client's most recent view of that, for rendering the counter without a
 * round trip.
 *
 * Auth is real (src/lib/onboarding/auth.ts, Supabase Auth) — a signed-in user
 * bypasses the free cap entirely (see /api/generate), so there is no
 * "authenticated" state to mock here any more.
 *
 * Paid credits are NOT wired to anything yet — no payment tier exists.
 * CREDIT_PACKS and the purchase helpers below stay in place, unused, for
 * when Stripe checkout is actually built; a signed-in user today gets
 * unlimited generations rather than a metered balance.
 */

const REMAINING_KEY = "lookrdy:free_remaining";
const CREDITS_KEY = "lookrdy:credits";

export const DEFAULT_FREE_GENERATIONS = 3;

export interface CreditPack {
  id: string;
  credits: number;
  price: number;
  currency: string;
  bestValue?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "pack_3", credits: 3, price: 4.99, currency: "CAD" },
  { id: "pack_8", credits: 8, price: 9.99, currency: "CAD", bestValue: true },
  { id: "pack_20", credits: 20, price: 17.99, currency: "CAD" },
];

function readNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function writeNumber(key: string, value: number) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* no-op */
  }
}

/** Client-side mirror of the server's remaining free generations. */
export function getFreeRemaining(): number {
  return readNumber(REMAINING_KEY, DEFAULT_FREE_GENERATIONS);
}

/** Called with the server's own numbers after each successful generation. */
export function syncFreeRemaining(used: number, allowed: number) {
  writeNumber(REMAINING_KEY, Math.max(0, allowed - used));
}

export function markLimitReached() {
  writeNumber(REMAINING_KEY, 0);
}

// --- Dormant until payment ships --------------------------------------------
// BACKEND BOUNDARY: replace with the credit balance from your ledger table,
// credited by a Stripe webhook after checkout completes.
export function getCreditBalance(): number {
  return readNumber(CREDITS_KEY, 0);
}

export function mockPurchase(pack: CreditPack) {
  writeNumber(CREDITS_KEY, getCreditBalance() + pack.credits);
}

export function spendCredit(): boolean {
  const balance = getCreditBalance();
  if (balance <= 0) return false;
  writeNumber(CREDITS_KEY, balance - 1);
  return true;
}

/**
 * True when the user may start another generation right now. A signed-in
 * user (pass `authenticated: true`, from useAuth()) is always allowed — the
 * server applies the same rule independently, this is just the client-side
 * check that avoids sending a request that would only bounce.
 */
export function canGenerate(authenticated = false): boolean {
  return authenticated || getFreeRemaining() > 0 || getCreditBalance() > 0;
}
