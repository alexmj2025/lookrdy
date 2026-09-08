"use client";

/**
 * Free generations, accounts and credits.
 *
 * BACKEND BOUNDARY. The authoritative free-generation count already lives
 * server-side: /api/generate reads it from the `generations` table keyed by an
 * httpOnly session cookie (src/lib/session.ts) and returns
 * `generationsUsed` / `generationsAllowed` on every success, or
 * `error: "limit_reached"` once the allowance is gone. This module holds only
 * the client's most recent view of that, for rendering the counter without a
 * round trip.
 *
 * Never treat these numbers as a security boundary — the server decides.
 * Auth and credit balance are mocked here and marked below; wire them to
 * Supabase Auth and Stripe at those two points.
 */

const REMAINING_KEY = "lookrdy:free_remaining";
const AUTH_KEY = "lookrdy:auth";
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

// --- Mocked until auth ships -----------------------------------------------
// BACKEND BOUNDARY: replace with Supabase Auth session state.
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function mockSignIn() {
  try {
    window.localStorage.setItem(AUTH_KEY, "1");
  } catch {
    /* no-op */
  }
}

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

/** True when the user may start another generation right now. */
export function canGenerate(): boolean {
  return getFreeRemaining() > 0 || getCreditBalance() > 0;
}
