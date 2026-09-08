"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client — the ANON key only, used for the user's own
 * auth session (sign up, sign in, sign out). This is deliberately a separate
 * client from src/lib/supabase/server.ts's service-role client: that one
 * bypasses row-level security and must never be reachable from the browser,
 * so the two are kept as distinctly named exports rather than one client
 * with a "which key" parameter that's easy to mix up under pressure.
 */

let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing).",
    );
  }

  cached = createBrowserClient(url, key);
  return cached;
}
