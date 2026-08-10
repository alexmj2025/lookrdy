import { NextResponse } from "next/server";
import { composeBundles } from "@/lib/ai/compose";
import { parseRequest } from "@/lib/ai/parseRequest";
import { visualize } from "@/lib/ai/visualize";
import { isMock } from "@/lib/ai/client";
import { retrieveCandidates } from "@/lib/catalog/retrieve";
import { zonesFor } from "@/lib/hotspots";
import { recordEvent } from "@/lib/analytics/record";
import {
  countGenerations,
  freeGenerationLimit,
  getSessionId,
  recordGeneration,
} from "@/lib/session";
import type { GenerationResult, Look, StyleRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * The orchestrator. Runs the pipeline in its mandated order:
 *
 *   1. PARSE     free text  → constraints
 *   2. RETRIEVE  constraints → real products from the catalog
 *   3. COMPOSE   real products → three bundles (budget enforced)
 *   4. VISUALIZE composed bundle + photo → image
 *
 * Step 4 receives a validated bundle and has no catalog access, so an image
 * can never be generated before the products behind it exist.
 *
 * The user's photo arrives as multipart form data, is held in memory for the
 * generation calls, and is never persisted anywhere.
 */
export async function POST(request: Request) {
  const sessionId = await getSessionId();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Malformed request." },
      { status: 400 },
    );
  }

  const req: StyleRequest = {
    occasion: String(form.get("occasion") ?? "").trim(),
    desiredLook: String(form.get("desiredLook") ?? "").trim(),
    budget: Number(form.get("budget")),
    currency: String(form.get("currency") ?? "CAD").trim() || "CAD",
    location: String(form.get("location") ?? "").trim(),
    exclusions: String(form.get("exclusions") ?? "").trim(),
  };

  if (
    !req.occasion ||
    !req.desiredLook ||
    !req.location ||
    !Number.isFinite(req.budget) ||
    req.budget <= 0
  ) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message:
          "We need an occasion, a description of the look, a positive budget, and a location.",
      },
      { status: 400 },
    );
  }

  // --- Free generation cap -------------------------------------------------
  const limit = freeGenerationLimit();
  const used = await countGenerations(sessionId);
  if (used >= limit) {
    return NextResponse.json(
      {
        error: "limit_reached",
        message: `You've used all ${limit} free looks in this session. Paid plans aren't live yet — thanks for trying Lookrdy.`,
      },
      { status: 200 },
    );
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
    // --- STEP 1: parse -----------------------------------------------------
    const constraints = await parseRequest(req);

    // --- STEP 2: retrieve real products FIRST ------------------------------
    const retrieval = await retrieveCandidates(constraints);
    if (!retrieval.ok) {
      await recordEvent(sessionId, "generation_completed", {
        outcome: "insufficient_catalog",
        reason: retrieval.reason,
      });
      return NextResponse.json(
        { error: "insufficient_catalog", message: retrieval.message },
        { status: 200 },
      );
    }

    // --- STEP 3: compose from those products only --------------------------
    const bundles = await composeBundles(retrieval.candidates, constraints);
    if (bundles.length === 0) {
      return NextResponse.json(
        {
          error: "insufficient_catalog",
          message: `We found pieces for "${req.occasion}" but couldn't assemble three complete looks within ${req.budget} ${req.currency}. Try raising the budget a little.`,
        },
        { status: 200 },
      );
    }

    // --- STEP 4: visualize the composed bundles ----------------------------
    const looks: Look[] = await Promise.all(
      bundles.map(async (bundle) => ({
        ...bundle,
        imageUrl: await visualize({
          bundle,
          photo,
          occasion: constraints.occasion,
        }),
        hotspots: zonesFor(bundle),
      })),
    );

    const engine = isMock() ? ("mock" as const) : ("openai" as const);
    await recordGeneration(sessionId, {
      occasion: req.occasion,
      budget: req.budget,
      currency: req.currency,
      engine,
    });
    await recordEvent(sessionId, "generation_completed", {
      outcome: "ok",
      engine,
      looks: looks.length,
    });

    const result: GenerationResult = {
      looks,
      constraints,
      request: req,
      engine,
      generationsUsed: used + 1,
      generationsAllowed: limit,
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
