import { NextResponse } from "next/server";
import { visualize } from "@/lib/ai/visualize";
import { isMock } from "@/lib/ai/client";
import { zonesFor } from "@/lib/hotspots";
import { recordEvent } from "@/lib/analytics/record";
import { getSupabaseSession } from "@/lib/supabase/server";
import {
  countGenerations,
  freeGenerationLimit,
  getSessionId,
  recordGeneration,
} from "@/lib/session";
import { BASE_MAX, BASE_MIN, composeSimonsOutfits } from "@/lib/simons/compose";
import { simonsOutfitsToBundles } from "@/lib/simons/toBundle";
import type { LookRole, Occasion } from "@/lib/simons/types";
import type { Constraints, GenerationResult, Look, StyleRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const VALID_OCCASIONS: Occasion[] = [
  "company_dinner",
  "date_upscale_dinner",
  "everyday_upgrade",
];
const VALID_ROLES: LookRole[] = ["Safe", "Polished", "Bold"];

const OCCASION_PROMPT: Record<Occasion, string> = {
  company_dinner: "a company dinner",
  date_upscale_dinner: "an upscale dinner date",
  everyday_upgrade: "everyday wear",
};
const OCCASION_LABEL: Record<Occasion, string> = {
  company_dinner: "Company dinner",
  date_upscale_dinner: "Date / upscale dinner",
  everyday_upgrade: "Everyday upgrade",
};

/**
 * The orchestrator — Simons pilot catalog only.
 *
 *   1. COMPOSE   fixed rules (src/lib/simons/compose.ts) → up to 3 bundles,
 *                deterministic, no LLM, base total always CAD 200-450.
 *   2. VISUALIZE composed bundle + photo → image (unchanged from before —
 *                it only ever reads item category/color/name text, never a
 *                product image, so it was already source-agnostic).
 *
 * The free-generation cap is skipped entirely for a signed-in user — real
 * accounts (src/lib/supabase/browser.ts + auth.ts) are unlimited, no
 * payment tier yet. Anonymous requests keep the existing session-cookie cap.
 *
 * The user's photo arrives as multipart form data, is held in memory for the
 * generation call, and is never persisted anywhere.
 */
export async function POST(request: Request) {
  const sessionId = await getSessionId();
  const user = await getSupabaseSession();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Malformed request." },
      { status: 400 },
    );
  }

  const occasion = String(form.get("occasion") ?? "") as Occasion;
  if (!VALID_OCCASIONS.includes(occasion)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Choose one of the available occasions.",
      },
      { status: 400 },
    );
  }

  const budgetMinRaw = Number(form.get("budgetMin"));
  const budgetMaxRaw = Number(form.get("budgetMax"));
  const budgetMin = Number.isFinite(budgetMinRaw)
    ? Math.max(BASE_MIN, Math.min(budgetMinRaw, BASE_MAX))
    : BASE_MIN;
  const budgetMax = Number.isFinite(budgetMaxRaw)
    ? Math.min(BASE_MAX, Math.max(budgetMaxRaw, BASE_MIN))
    : BASE_MAX;

  const avoidText = String(form.get("avoidText") ?? "").trim();
  const stylePreferenceRaw = String(form.get("stylePreference") ?? "");
  const stylePreference = VALID_ROLES.includes(stylePreferenceRaw as LookRole)
    ? (stylePreferenceRaw as LookRole)
    : null;

  // --- Free generation cap — skipped entirely for a signed-in user ---------
  const limit = freeGenerationLimit();
  let used = 0;
  if (!user) {
    used = await countGenerations(sessionId);
    if (used >= limit) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: `You've used all ${limit} free looks. Create an account for unlimited looks.`,
        },
        { status: 200 },
      );
    }
  }

  // --- Photo: memory only, never written anywhere --------------------------
  let photo: { data: Buffer; mimeType: string } | null = null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "That photo is larger than 12 MB. Please use a smaller image.",
        },
        { status: 400 },
      );
    }
    photo = {
      data: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type || "image/jpeg",
    };
  }

  try {
    // --- COMPOSE: deterministic, rule-driven, no LLM ------------------------
    const outfits = composeSimonsOutfits(occasion, {
      budgetMin,
      budgetMax,
      avoidText,
    });

    if (outfits.length === 0) {
      return NextResponse.json(
        {
          error: "insufficient_catalog",
          message:
            "We couldn't build a complete look in that budget range for this occasion. Try widening the range or removing an exclusion.",
        },
        { status: 200 },
      );
    }

    const bundles = simonsOutfitsToBundles(outfits, stylePreference);

    // --- VISUALIZE -----------------------------------------------------------
    const looks: Look[] = await Promise.all(
      bundles.map(async (bundle) => ({
        ...bundle,
        imageUrl: await visualize({
          bundle,
          photo,
          occasion: OCCASION_PROMPT[occasion],
        }),
        hotspots: zonesFor(bundle),
      })),
    );

    const engine = isMock() ? ("mock" as const) : ("openai" as const);

    if (!user) {
      await recordGeneration(sessionId, {
        occasion,
        budget: budgetMax,
        currency: "CAD",
        engine,
      });
    }
    await recordEvent(sessionId, "generation_completed", {
      outcome: "ok",
      engine,
      looks: looks.length,
      authenticated: Boolean(user),
    });

    const req: StyleRequest = {
      occasion: OCCASION_LABEL[occasion],
      desiredLook: stylePreference ?? "",
      budget: budgetMax,
      currency: "CAD",
      location: "Canada",
      exclusions: avoidText,
    };

    const constraints: Constraints = {
      occasion: OCCASION_LABEL[occasion],
      formalityMin: 1,
      formalityMax: 5,
      styleTags: stylePreference ? [stylePreference] : [],
      colors: [],
      exclusions: avoidText ? [avoidText] : [],
      budget: budgetMax,
      currency: "CAD",
      location: "Canada",
      country: "CA",
      requiredCategories: ["top", "trousers", "shoes"],
    };

    const result: GenerationResult = {
      looks,
      constraints,
      request: req,
      engine,
      // Infinity does not survive JSON.stringify (becomes null) — use a large
      // finite sentinel instead. The client never actually gates on this
      // number for a signed-in user (see CreditCounter/canGenerate), so its
      // exact value only matters for not being JSON-corrupting.
      generationsUsed: user ? 0 : used + 1,
      generationsAllowed: user ? Number.MAX_SAFE_INTEGER : limit,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("[generate] pipeline failed", err);
    return NextResponse.json(
      {
        error: "engine_failure",
        message:
          "Something went wrong while putting your looks together. Please try again.",
      },
      { status: 502 },
    );
  } finally {
    // Drop the photo reference as soon as the request is done.
    photo = null;
  }
}
