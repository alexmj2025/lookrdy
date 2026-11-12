import { NextResponse } from "next/server";
import { visualize } from "@/lib/ai/visualize";
import { imageSettings } from "@/lib/ai/imageSettings";
import { preparePhoto } from "@/lib/ai/preparePhoto";
import { zonesFor } from "@/lib/hotspots";
import { recordEvent } from "@/lib/analytics/record";
import { getSessionId, recordGeneration } from "@/lib/session";
import { accountRequired, beginLookTrial, claimLookPreview } from "@/lib/guestTrial";
import { BASE_MAX, BASE_MIN, composeSimonsOutfits } from "@/lib/simons/compose";
import { simonsOutfitsToBundles } from "@/lib/simons/toBundle";
import type { Occasion } from "@/lib/simons/types";
import type { Constraints, GenerationResult, Look, StyleRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const VALID_OCCASIONS: Occasion[] = [
  "company_dinner",
  "date_upscale_dinner",
  "everyday_upgrade",
];

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

function publicLook(look: Look): Look {
  const omitReference = ({ generationImageUrl: _reference, ...item }: Look["items"][number]) => item;
  return { ...look, items: look.items.map(omitReference), layers: look.layers?.map(omitReference) };
}

/**
 * The orchestrator — Simons pilot catalog only.
 *
 *   1. COMPOSE   fixed rules (src/lib/simons/compose.ts) → up to 3 bundles,
 *                deterministic, no LLM, base total always CAD 200-450.
 *   2. VISUALIZE composed bundle + photo → guided image edit,
 *                using garment attributes and authorized local references.
 *                Only an explicit outfit preview request calls a provider.
 *
 * The user's photo arrives as multipart form data, is held in memory for the
 * generation call, and is never persisted anywhere.
 */
export async function POST(request: Request) {
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
  const previewLookId = form.get("previewLookId");

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

    const bundles = simonsOutfitsToBundles(outfits, null);
    const { engine, configurationError } = imageSettings();

    // --- VISUALIZE -----------------------------------------------------------
    const looks: Look[] = bundles.map((bundle) => ({
        ...bundle,
        imageUrl: "",
        previewStatus: "products-only",
        previewNotice: "Generate a preview to see this outfit on your photo.",
        hotspots: zonesFor(bundle),
    }));

    if (previewLookId !== null) {
      if (configurationError) {
        return NextResponse.json({ message: "Live previews are temporarily unavailable. Your shopping list is ready." }, { status: 503 });
      }
      const look = looks.find((item) => item.id === previewLookId);
      const itemIds = form.getAll("previewItemId");
      if (!look || itemIds.length !== look.items.length || look.items.some((item, index) => item.id !== itemIds[index])) {
        return NextResponse.json({ error: "invalid_request", message: "This outfit has changed. Build new looks before requesting a preview." }, { status: 409 });
      }
      const file = form.get("photo");
      if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: "invalid_request", message: "Choose a full-body JPG, PNG, or WebP photo under 4 MB." }, { status: 400 });
      }
      let photo: Awaited<ReturnType<typeof preparePhoto>>;
      try {
        photo = await preparePhoto(Buffer.from(await file.arrayBuffer()));
      } catch {
        return NextResponse.json({ error: "invalid_request", message: "That photo couldn't be opened. Try a JPG, PNG, or WebP image." }, { status: 400 });
      }

      if (!await claimLookPreview(form.get("trialId"))) {
        return NextResponse.json(accountRequired, { status: 403 });
      }
      const sessionId = await getSessionId();
      const preview = await visualize({ bundle: look, photo, occasion: OCCASION_PROMPT[occasion] });
      await Promise.allSettled([
        recordGeneration(sessionId, { occasion, budget: budgetMax, currency: "CAD", engine }),
        recordEvent(sessionId, "generation_completed", {
          outcome: preview.previewStatus, engine, looks: 1,
          previewsReady: preview.previewStatus === "ready" ? 1 : 0,
        }),
      ]);
      return NextResponse.json({ look: publicLook({ ...look, ...preview }) }, { headers: { "Cache-Control": "no-store" } });
    }

    const req: StyleRequest = {
      occasion: OCCASION_LABEL[occasion],
      desiredLook: "",
      budget: budgetMax,
      currency: "CAD",
      location: "Canada",
      exclusions: avoidText,
    };

    const constraints: Constraints = {
      occasion: OCCASION_LABEL[occasion],
      formalityMin: 1,
      formalityMax: 5,
      styleTags: [],
      colors: [],
      exclusions: avoidText ? [avoidText] : [],
      budget: budgetMax,
      currency: "CAD",
      location: "Canada",
      country: "CA",
      requiredCategories: ["top", "trousers", "shoes"],
    };

    const trial = await beginLookTrial("simons");
    if (!trial.allowed) return NextResponse.json(accountRequired, { status: 403 });
    const result: GenerationResult = {
      searchId: crypto.randomUUID(),
      looks: looks.map(publicLook),
      constraints,
      request: req,
      engine,
      previewRequest: { occasion, budgetMin, budgetMax, avoidText, trialId: trial.trialId },
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
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
  }
}
