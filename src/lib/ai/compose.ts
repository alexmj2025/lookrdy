import "server-only";
import { getOpenAI, isMock, TEXT_MODEL } from "./client";
import { OPTIONAL, REQUIRED } from "@/lib/catalog/retrieve";
import type { Bundle, Category, Constraints, Product } from "@/lib/types";

// ============================================================================
// PIPELINE STEP 3 — COMPOSE.
//
// Takes the products retrieved in step 2 and composes three bundles from them.
// The model is only ever shown the retrieved list and may only reference those
// ids: it composes and explains, it does not search or invent.
//
// Everything the model returns is re-validated here against the candidate set,
// and every total is recomputed from catalog prices. The budget is a HARD
// constraint on the outfit total — never trusted from the model, never applied
// per item.
// ============================================================================

const BUNDLES_SCHEMA = {
  type: "object",
  properties: {
    bundles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          descriptors: { type: "array", items: { type: "string" } },
          rationale: { type: "string" },
          recommended: { type: "boolean" },
          productIds: { type: "array", items: { type: "string" } },
        },
        required: ["name", "descriptors", "rationale", "recommended", "productIds"],
        additionalProperties: false,
      },
    },
  },
  required: ["bundles"],
  additionalProperties: false,
} as const;

interface RawBundle {
  name: string;
  descriptors: string[];
  rationale: string;
  recommended: boolean;
  productIds: string[];
}

export async function composeBundles(
  candidates: Product[],
  c: Constraints,
): Promise<Bundle[]> {
  const raw = isMock()
    ? mockCompose(candidates, c)
    : await aiCompose(candidates, c);

  const bundles = validate(raw, candidates, c);

  // Guarantee three looks: if validation dropped any, backfill deterministically
  // so the user never sees a half-empty results page.
  if (bundles.length < 3) {
    const filler = validate(mockCompose(candidates, c), candidates, c);
    for (const b of filler) {
      if (bundles.length >= 3) break;
      const signature = (x: Bundle) =>
        x.items.map((i) => i.id).sort().join("|");
      if (!bundles.some((existing) => signature(existing) === signature(b))) {
        bundles.push(b);
      }
    }
  }

  const final = bundles.slice(0, 3).map((b, i) => ({ ...b, id: `look-${i + 1}` }));

  // Exactly one recommended.
  const flagged = final.findIndex((b) => b.recommended);
  return final.map((b, i) => ({
    ...b,
    recommended: i === (flagged === -1 ? 0 : flagged),
  }));
}

// ---------------------------------------------------------------------------
// Live composition
// ---------------------------------------------------------------------------

async function aiCompose(
  candidates: Product[],
  c: Constraints,
): Promise<RawBundle[]> {
  const list = candidates
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${p.category} | ${p.color} | ${p.price} ${p.currency} | formality ${p.formality}/5 | ${p.styleTags.join(",")} | ${p.retailer}`,
    )
    .join("\n");

  const response = await getOpenAI().chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content:
          "You are a menswear stylist. You compose outfits ONLY from the numbered product list you are given — never invent, rename, or substitute a product, and never output an id that is not in the list. You return JSON matching the schema.",
      },
      {
        role: "user",
        content: `Compose exactly 3 distinct outfit bundles.

CLIENT
- Occasion: ${c.occasion}
- Wants to look: ${c.styleTags.join(", ")}${c.colors.length ? ` · colors: ${c.colors.join(", ")}` : ""}
- Location: ${c.location} (consider climate and local norms)
- TOTAL budget: ${c.budget} ${c.currency} — a HARD cap on the sum of each bundle's prices. Every bundle must be at or under it.

RULES
- Each bundle must contain exactly one "top", one "trousers", and one "shoes".
- You may add at most one "jacket", one "bag", and one "accessory" if they improve the look AND the total still fits the budget.
- Use only ids from the list. Put them in "productIds".
- The three bundles must be genuinely different directions, not variations of one outfit.
- Mark exactly one bundle "recommended": the best fit for the brief.
- "rationale" is ONE plain-language sentence a non-fashion person understands.
- "descriptors" are 2–3 short style words.
- Give each bundle a short, evocative name (2–3 words).

AVAILABLE PRODUCTS
id | name | category | color | price | formality | tags | retailer
${list}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "outfit_bundles",
        strict: true,
        schema: BUNDLES_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("empty composition response");
  return (JSON.parse(text) as { bundles: RawBundle[] }).bundles;
}

// ---------------------------------------------------------------------------
// Validation + hard budget enforcement
// ---------------------------------------------------------------------------

function validate(
  raw: RawBundle[],
  candidates: Product[],
  c: Constraints,
): Bundle[] {
  const allowed = new Map(candidates.map((p) => [p.id, p]));
  const out: Bundle[] = [];

  for (const [i, b] of raw.entries()) {
    // Only ids that actually exist in the retrieved set survive.
    let items = (b.productIds ?? [])
      .map((id) => allowed.get(id))
      .filter((p): p is Product => Boolean(p));

    // One item per category, required categories present.
    items = dedupeByCategory(items);
    if (!REQUIRED.every((cat) => items.some((p) => p.category === cat))) continue;

    items = enforceBudget(items, candidates, c.budget);
    if (items.length === 0) continue;

    const total = round2(items.reduce((sum, p) => sum + p.price, 0));
    if (total > c.budget) continue;

    out.push({
      id: `look-${i + 1}`,
      name: b.name?.trim() || `Look ${i + 1}`,
      descriptors: (b.descriptors ?? []).slice(0, 3),
      rationale:
        b.rationale?.trim() ||
        `A balanced look for ${c.occasion.toLowerCase()} that stays within budget.`,
      recommended: Boolean(b.recommended),
      items: sortForDisplay(items),
      total,
    });
  }

  return out;
}

function dedupeByCategory(items: Product[]): Product[] {
  const seen = new Set<Category>();
  return items.filter((p) => {
    if (seen.has(p.category)) return false;
    seen.add(p.category);
    return true;
  });
}

/**
 * Hard budget enforcement. First drop optional extras (accessory → bag →
 * jacket), then downgrade the priciest required piece to a cheaper item in the
 * same category. Returns [] if the bundle can't be made to fit.
 */
function enforceBudget(
  items: Product[],
  candidates: Product[],
  budget: number,
): Product[] {
  let current = [...items];
  const total = () => current.reduce((s, p) => s + p.price, 0);

  for (const optional of ["accessory", "bag", "jacket"] as const) {
    if (total() <= budget) break;
    current = current.filter((p) => p.category !== optional);
  }

  let guard = 0;
  while (total() > budget && guard++ < 12) {
    const byPrice = [...current].sort((a, b) => b.price - a.price);
    let swapped = false;
    for (const expensive of byPrice) {
      const cheaper = candidates
        .filter(
          (p) =>
            p.category === expensive.category &&
            p.price < expensive.price &&
            !current.some((x) => x.id === p.id),
        )
        .sort((a, b) => b.price - a.price)[0];
      if (cheaper) {
        current = current.map((p) => (p.id === expensive.id ? cheaper : p));
        swapped = true;
        break;
      }
    }
    if (!swapped) break;
  }

  return total() <= budget ? current : [];
}

const DISPLAY_ORDER: Category[] = [
  "jacket",
  "top",
  "trousers",
  "shoes",
  "bag",
  "accessory",
];

function sortForDisplay(items: Product[]): Product[] {
  return [...items].sort(
    (a, b) => DISPLAY_ORDER.indexOf(a.category) - DISPLAY_ORDER.indexOf(b.category),
  );
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Deterministic composition (MOCK_AI=1, or backfill when validation drops one)
// ---------------------------------------------------------------------------

const NAMES = ["Clean Line", "Soft Contrast", "Quiet Statement"];
const MOODS = [
  ["minimal", "tonal", "sharp"],
  ["relaxed", "textured", "warm"],
  ["refined", "understated"],
];

function mockCompose(candidates: Product[], c: Constraints): RawBundle[] {
  const pool = (cat: Category) => candidates.filter((p) => p.category === cat);
  const tops = pool("top");
  const trousers = pool("trousers");
  const shoes = pool("shoes");
  const jackets = pool("jacket");
  const bags = pool("bag");

  const bundles: RawBundle[] = [];

  for (let i = 0; i < 3; i++) {
    const at = <T>(arr: T[], offset: number): T | undefined =>
      arr.length ? arr[(i * 2 + offset) % arr.length] : undefined;

    const top = at(tops, 0);
    const bottom = at(trousers, 1);
    const shoe = at(shoes, 2);
    if (!top || !bottom || !shoe) continue;

    const ids = [top.id, bottom.id, shoe.id];
    let running = top.price + bottom.price + shoe.price;

    const jacket = at(jackets, i);
    if (jacket && running + jacket.price <= c.budget) {
      ids.push(jacket.id);
      running += jacket.price;
    }
    const bag = at(bags, i);
    if (bag && running + bag.price <= c.budget) ids.push(bag.id);

    bundles.push({
      name: NAMES[i],
      descriptors: MOODS[i],
      recommended: i === 0,
      rationale: `Reads ${MOODS[i].slice(0, 2).join(" and ")} for ${c.occasion.toLowerCase()} in ${c.location}, and comes in under your budget.`,
      productIds: ids,
    });
  }

  return bundles;
}

export { OPTIONAL };
