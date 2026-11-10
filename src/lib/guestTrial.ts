import "server-only";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSupabaseSession } from "@/lib/supabase/server";

const COOKIE = "lookrdy_trial";
const fallbackSecret = randomBytes(32);
const attempts = new Map<string, number>();
const TTL = 60 * 60 * 24 * 30;
export const accountRequired = {
  error: "account_required",
  message: "Your first try is complete. Create an account or sign in to keep styling.",
};
type Mode = "simons" | "wardrobe";

function sign(payload: string) {
  return createHmac("sha256", process.env.LOOKRDY_TRIAL_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackSecret)
    .update(payload).digest("hex");
}

async function trialCookie() {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  const match = value?.match(/^((simons|wardrobe)\.([a-f0-9-]{36})\.([01]))\.([a-f0-9]{64})$/);
  const trial = match && timingSafeEqual(Buffer.from(sign(match[1])), Buffer.from(match[5]))
    ? { mode: match[2], id: match[3], rendered: match[4] === "1" }
    : null;
  const write = (mode: Mode, id: string, rendered: boolean) => {
    const payload = `${mode}.${id}.${rendered ? "1" : "0"}`;
    jar.set(COOKIE, `${payload}.${sign(payload)}`, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL,
    });
  };
  return { trial, write };
}

export async function beginLookTrial(mode: Mode) {
  if (await getSupabaseSession()) return { allowed: true, trialId: null };
  const { trial, write } = await trialCookie();
  if (trial) return { allowed: false, trialId: null };
  const trialId = randomUUID();
  write(mode, trialId, false);
  return { allowed: true, trialId };
}

export async function claimLookPreview(trialId: FormDataEntryValue | null) {
  if (await getSupabaseSession()) return true;
  const { trial, write } = await trialCookie();
  const now = Date.now();
  for (const [id, expires] of attempts) if (expires < now) attempts.delete(id);
  if (!trial || trial.mode !== "simons" || trial.id !== trialId || trial.rendered || attempts.has(trial.id)) return false;
  // Reject concurrent replays on this worker before sending a paid request.
  attempts.set(trial.id, now + 10 * 60_000);
  write("simons", trial.id, true);
  return true;
}
