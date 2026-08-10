import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key.
 *
 * NEVER import this from a client component — the service-role key bypasses
 * row-level security. The `server-only` import above turns any accidental
 * client import into a build error.
 *
 * Returns null when credentials are absent, which is the signal for callers to
 * use their local fallback (see src/lib/catalog/source.ts and
 * src/lib/analytics/record.ts). That keeps the app runnable before Supabase is
 * wired up.
 */

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    cached = null;
    return cached;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
