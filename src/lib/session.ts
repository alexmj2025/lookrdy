import "server-only";
import { cookies } from "next/headers";
import { getSupabase } from "./supabase/server";

// Anonymous session identity + the free-generation cap. No accounts, no PII —
// just an opaque id in a cookie.

const COOKIE = "lookrdy_sid";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function freeGenerationLimit(): number {
  const n = Number(process.env.FREE_GENERATION_LIMIT);
  return Number.isFinite(n) && n > 0 ? n : 3;
}

/** Reads the session id, minting one if absent. */
export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  try {
    jar.set(COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: MAX_AGE,
      path: "/",
    });
  } catch {
    // Cookies are read-only in some render contexts; the id still works for
    // this request.
  }
  return id;
}

// In-memory counter used when Supabase isn't configured. Per-process, so it
// resets on restart — fine for local development.
const localCounts = new Map<string, number>();

export async function countGenerations(sessionId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return localCounts.get(sessionId) ?? 0;

  const { count, error } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  if (error) {
    console.warn(`[session] generation count failed: ${error.message}`);
    return localCounts.get(sessionId) ?? 0;
  }
  return count ?? 0;
}

export async function recordGeneration(
  sessionId: string,
  meta: { occasion: string; budget: number; currency: string; engine: string },
): Promise<void> {
  localCounts.set(sessionId, (localCounts.get(sessionId) ?? 0) + 1);

  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("generations").insert({
    session_id: sessionId,
    occasion: meta.occasion,
    budget: meta.budget,
    currency: meta.currency,
    engine: meta.engine,
  });
  if (error) console.warn(`[session] generation insert failed: ${error.message}`);
}
