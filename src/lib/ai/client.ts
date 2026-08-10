import "server-only";
import OpenAI from "openai";

/**
 * OpenAI client. Server-side only — the key is never exposed to the browser.
 *
 * `isMock()` is the single switch that keeps the whole app usable without API
 * credits: when it's true, every AI step falls back to a deterministic
 * implementation and no network call is made. The live code path is still the
 * primary one; mock is the fallback, not the other way round.
 */

export const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? "gpt-4o";
export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

export function isMock(): boolean {
  return process.env.MOCK_AI === "1" || !process.env.OPENAI_API_KEY;
}

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) client = new OpenAI();
  return client;
}

/** True when an error is OpenAI's "no credits" response. */
export function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /insufficient_quota|exceeded your current quota|429/.test(msg);
}
