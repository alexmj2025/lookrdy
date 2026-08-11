import { NextResponse } from "next/server";
import { isMock, TEXT_MODEL, IMAGE_MODEL } from "@/lib/ai/client";
import { getAllProducts, getCatalogStatus } from "@/lib/catalog/source";
import { getSupabase } from "@/lib/supabase/server";
import { freeGenerationLimit } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deployment smoke check: which backends are ACTUALLY live.
 *
 * Both the catalog and the analytics sink fall back silently by design, so a
 * misconfigured deploy still serves a working-looking app off local JSON.
 * This endpoint makes that visible in one request — hit it right after a
 * Vercel deploy to confirm the env vars really took.
 *
 * Deliberately leaks no secrets: it reports whether a key is present, never
 * any part of its value.
 */
export async function GET() {
  const products = await getAllProducts();
  const catalog = getCatalogStatus();
  const supabase = getSupabase();

  // Probe the write-side tables separately — the catalog can be healthy while
  // events/generations are missing, since they're created by the same schema
  // but read through different code paths.
  const tables: Record<string, string> = {};
  if (supabase) {
    for (const table of ["products", "generations", "events"] as const) {
      const { error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      tables[table] = error ? `unavailable: ${error.message}` : "ok";
    }
  }

  return NextResponse.json({
    status: "ok",
    catalog: {
      source: catalog.source,
      productCount: products.length,
      error: catalog.error,
    },
    supabase: {
      configured: supabase !== null,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
      serviceRoleKeyPresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      tables,
    },
    ai: {
      engine: isMock() ? "mock" : "openai",
      apiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
      textModel: TEXT_MODEL,
      imageModel: IMAGE_MODEL,
    },
    freeGenerationLimit: freeGenerationLimit(),
    checkedAt: new Date().toISOString(),
  });
}
