import "server-only";
import { getOpenAI, isMock, TEXT_MODEL } from "./client";
import { REQUIRED } from "@/lib/catalog/retrieve";
import type { Constraints, StyleRequest } from "@/lib/types";

// ============================================================================
// PIPELINE STEP 1 — PARSE.
//
// Turns the user's form input and free-text "how do you want to look" into
// structured constraints that retrieval can filter on. This step never sees
// the catalog and never picks products.
// ============================================================================

const CONSTRAINTS_SCHEMA = {
  type: "object",
  properties: {
    formalityMin: { type: "integer", minimum: 1, maximum: 5 },
    formalityMax: { type: "integer", minimum: 1, maximum: 5 },
    styleTags: {
      type: "array",
      items: { type: "string" },
      description:
        "Lowercase single-word style descriptors drawn from: minimal, tailored, relaxed, streetwear, classic, refined, technical, heritage, textured, monochrome, warm, clean, bold, casual, formal, ivy, denim, utility, architectural, luxe, soft, retro, modern, essential, versatile, patterned, layering, practical, neutral, crisp, sleek, rugged, summer, comfort.",
    },
    colors: {
      type: "array",
      items: { type: "string" },
      description: "Colors the user asked for. Empty if they didn't say.",
    },
    exclusions: {
      type: "array",
      items: { type: "string" },
      description:
        "Things to avoid, as lowercase keywords (e.g. 'suit', 'white', 'sneakers').",
    },
  },
  required: ["formalityMin", "formalityMax", "styleTags", "colors", "exclusions"],
  additionalProperties: false,
} as const;

/** Country inference from a free-text location. Extend as you add retailers. */
const COUNTRY_HINTS: Array<[RegExp, string]> = [
  [/\b(canada|toronto|montreal|vancouver|calgary|ottawa|quebec|ontario)\b/i, "CA"],
  [/\b(usa|united states|new york|nyc|los angeles|chicago|seattle|boston|austin|texas|california)\b/i, "US"],
  [/\b(uk|england|london|manchester|scotland|britain)\b/i, "GB"],
  [/\b(japan|tokyo|osaka|kyoto)\b/i, "JP"],
  [/\b(australia|sydney|melbourne)\b/i, "AU"],
  [/\b(germany|berlin|munich)\b/i, "DE"],
  [/\b(france|paris)\b/i, "FR"],
];

/**
 * Returns the ISO country code for a location, or null when we can't tell.
 *
 * Null matters: rather than silently assuming Canada and showing someone in
 * Reykjavik a set of Canadian-only retailers, retrieval skips the shipping
 * filter and surfaces every retailer, and the UI notes that we couldn't
 * confirm shipping. Guessing here would produce a confidently wrong answer.
 */
export function inferCountry(location: string): string | null {
  for (const [re, code] of COUNTRY_HINTS) {
    if (re.test(location)) return code;
  }
  return null;
}

/** Keyword formality bands — also the mock path and the fallback if AI fails. */
export function formalityBandFor(occasion: string): [number, number] {
  const o = occasion.toLowerCase();
  if (/(wedding|black tie|gala|funeral|formal)/.test(o)) return [4, 5];
  if (/(interview|board|client|presentation|conference)/.test(o)) return [3, 5];
  if (/(company dinner|work dinner|business dinner|office|work)/.test(o)) return [3, 4];
  if (/(date|dinner|cocktail|party|gallery|theatre|theater)/.test(o)) return [2, 4];
  if (/(travel|everyday|weekend|casual|brunch|errand|concert)/.test(o)) return [1, 3];
  return [2, 4];
}

const TAG_HINTS: Array<[RegExp, string]> = [
  [/\b(minimal|simple|clean|understated|pared)\b/i, "minimal"],
  [/\b(sharp|tailored|smart|polished)\b/i, "tailored"],
  [/\b(relaxed|loose|easy|comfortable|comfy)\b/i, "relaxed"],
  [/\b(street|streetwear|hype|baggy)\b/i, "streetwear"],
  [/\b(classic|timeless|traditional)\b/i, "classic"],
  [/\b(refined|elegant|sophisticated|luxe|premium)\b/i, "refined"],
  [/\b(monochrome|black and white|all black|tonal)\b/i, "monochrome"],
  [/\b(warm|cozy|cosy)\b/i, "warm"],
  [/\b(bold|statement|striking)\b/i, "bold"],
  [/\b(textured|texture|rough)\b/i, "textured"],
  [/\b(modern|contemporary|current)\b/i, "modern"],
  [/\b(heritage|vintage|retro)\b/i, "heritage"],
];

const COLOR_WORDS =
  /\b(black|white|navy|grey|gray|charcoal|beige|cream|olive|brown|tan|burgundy|green|blue|stone|ecru|camel)\b/gi;

function heuristicConstraints(req: StyleRequest): Constraints {
  const [formalityMin, formalityMax] = formalityBandFor(req.occasion);
  const text = `${req.desiredLook} ${req.occasion}`;

  const styleTags = TAG_HINTS.filter(([re]) => re.test(text)).map(([, tag]) => tag);
  const colors = Array.from(
    new Set((req.desiredLook.match(COLOR_WORDS) ?? []).map((c) => c.toLowerCase())),
  );
  const exclusions = req.exclusions
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 2);

  return {
    occasion: req.occasion,
    formalityMin,
    formalityMax,
    styleTags: styleTags.length ? styleTags : ["minimal", "versatile"],
    colors,
    exclusions,
    budget: req.budget,
    currency: req.currency,
    location: req.location,
    country: inferCountry(req.location),
    requiredCategories: REQUIRED,
  };
}

export async function parseRequest(req: StyleRequest): Promise<Constraints> {
  const base = heuristicConstraints(req);
  if (isMock()) return base;

  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: TEXT_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You convert a menswear styling request into structured filter constraints. Be conservative: only report a color or exclusion the user actually expressed. Formality: 1 = very casual, 3 = smart casual, 5 = formal.",
        },
        {
          role: "user",
          content: `Occasion: ${req.occasion}
How they want to look: ${req.desiredLook}
Location: ${req.location}
Budget: ${req.budget} ${req.currency}
Things to avoid: ${req.exclusions || "(none given)"}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "style_constraints",
          strict: true,
          schema: CONSTRAINTS_SCHEMA as unknown as Record<string, unknown>,
        },
      },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Constraints>;

    const min = Number(parsed.formalityMin);
    const max = Number(parsed.formalityMax);
    return {
      ...base,
      formalityMin: Number.isFinite(min) ? Math.min(min, max || 5) : base.formalityMin,
      formalityMax: Number.isFinite(max) ? Math.max(max, min || 1) : base.formalityMax,
      styleTags: parsed.styleTags?.length ? parsed.styleTags : base.styleTags,
      colors: parsed.colors ?? base.colors,
      // Union: never lose an exclusion the user typed literally.
      exclusions: Array.from(
        new Set([...(parsed.exclusions ?? []), ...base.exclusions]),
      ),
    };
  } catch {
    // Parsing is an optimization, not a gate — fall back to the heuristics so
    // a transient AI failure never blocks the user.
    return base;
  }
}
