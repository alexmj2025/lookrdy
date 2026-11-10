import "server-only";
import { cookies } from "next/headers";
import { getSupabase } from "./supabase/server";

// Opaque session identity for generation analytics.

const COOKIE = "lookrdy_sid";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

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

export async function recordGeneration(
  sessionId: string,
  meta: { occasion: string; budget: number; currency: string; engine: string },
): Promise<void> {
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
