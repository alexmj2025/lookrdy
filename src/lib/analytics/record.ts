import "server-only";
import { appendFile } from "node:fs/promises";
import { getSupabase } from "@/lib/supabase/server";
import type { FunnelEvent } from "@/lib/types";

/**
 * Funnel event sink.
 *
 * Writes to the Supabase `events` table when configured; otherwise appends
 * JSON lines to .lookrdy-events.log at the project root so the funnel is still
 * inspectable during local development.
 *
 * Swap this for PostHog by replacing the body of `recordEvent` — the call
 * sites (src/lib/analytics/client.ts) don't change.
 */

const LOG_FILE = ".lookrdy-events.log";

export async function recordEvent(
  sessionId: string,
  event: FunnelEvent,
  properties: Record<string, unknown> = {},
): Promise<void> {
  const row = {
    session_id: sessionId,
    event,
    properties,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("events").insert(row);
    if (!error) return;
    console.warn(`[analytics] Supabase insert failed: ${error.message}`);
  }

  try {
    await appendFile(LOG_FILE, `${JSON.stringify(row)}\n`, "utf8");
  } catch {
    // Analytics must never break the user flow.
  }
}
