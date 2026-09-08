import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
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

/**
 * A SEPARATE client from getSupabase() above: this one carries the calling
 * user's own session (via the auth cookie), not the service-role key, and
 * respects row-level security rather than bypassing it. Use this — never
 * getSupabase() — anywhere you need to know who is actually signed in.
 */
export async function getSupabaseSession() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const jar = await cookies();
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) {
            jar.set(name, value, options);
          }
        } catch {
          // Cookies are read-only in some render contexts (e.g. a Server
          // Component render) — middleware.ts is what actually refreshes the
          // session cookie; a failure here just means this one call can't.
        }
      },
    },
  });

  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}
