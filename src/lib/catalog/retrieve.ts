import "server-only";
import { getAllProducts } from "./source";
import type { Category, Constraints, Product } from "@/lib/types";

// ============================================================================
// PIPELINE STEP 2 — RETRIEVE.
//
// Turns parsed constraints into a set of REAL, eligible catalog products.
// This runs before any composition, and composition is only ever allowed to
// pick from what this returns. Nothing here calls an LLM.
// ============================================================================

/** Every look must cover these. Bags/accessories/jackets are optional extras. */
export const REQUIRED: Category[] = ["top", "trousers", "shoes"];
export const OPTIONAL: Category[] = ["jacket", "bag", "accessory"];

export interface RetrievalOk {
  ok: true;
  candidates: Product[];
  /** Cheapest possible top+trousers+shoes total in this candidate set. */
  floorPrice: number;
}

export interface RetrievalFail {
  ok: false;
  /** Which constraint made this impossible — used for an honest message. */
  reason: "no_products_for_location" | "no_products_for_occasion" | "budget_too_low";
  message: string;
  floorPrice: number | null;
}

export type RetrievalResult = RetrievalOk | RetrievalFail;

function cheapestIn(list: Product[]): Product | null {
  return list.length
    ? list.reduce((a, b) => (a.price <= b.price ? a : b))
    : null;
}

/**
 * Relevance score. Ranking is driven purely by fit to the user's request —
 * style tag overlap, color match, and formality proximity.
 *
 * IMPORTANT: organic ranking must stay independent of any affiliate
 * consideration. Do not add commission, payout, or partner-priority terms
 * here. Affiliate handling belongs solely in src/lib/affiliate.ts, which only
 * rewrites the outbound href.
 */
function score(product: Product, c: Constraints): number {
  let s = 0;

  const tags = new Set(product.styleTags.map((t) => t.toLowerCase()));
  for (const wanted of c.styleTags) {
    if (tags.has(wanted.toLowerCase())) s += 3;
  }

  for (const color of c.colors) {
    if (product.color.toLowerCase().includes(color.toLowerCase())) s += 2;
  }

  // Closer to the middle of the requested formality band scores higher.
  const mid = (c.formalityMin + c.formalityMax) / 2;
  s += Math.max(0, 3 - Math.abs(product.formality - mid));

  return s;
}

function isExcluded(product: Product, exclusions: string[]): boolean {
  if (exclusions.length === 0) return false;
  const haystack = [
    product.name,
    product.color,
    product.category,
    ...product.styleTags,
  ]
    .join(" ")
    .toLowerCase();
  return exclusions.some((ex) => {
    const term = ex.trim().toLowerCase();
    return term.length > 2 && haystack.includes(term);
  });
}

export async function retrieveCandidates(
  c: Constraints,
): Promise<RetrievalResult> {
  const all = await getAllProducts();

  // 1. Location — the retailer must actually ship to the user's country.
  //    When the country couldn't be resolved from the free-text location we
  //    do NOT guess: every retailer stays eligible and the UI tells the user
  //    we couldn't confirm shipping. Guessing would be confidently wrong.
  const shippable =
    c.country === null
      ? all
      : all.filter((p) => p.countries.includes(c.country as string));

  if (shippable.length === 0) {
    return {
      ok: false,
      reason: "no_products_for_location",
      message: `None of our retailers currently ship to ${c.location}. Try a different location, or check back once we add local stockists.`,
      floorPrice: null,
    };
  }

  // 2. Occasion (formality band) and exclusions.
  const bandMin = Math.max(1, c.formalityMin);
  const bandMax = Math.min(5, c.formalityMax);
  let eligible = shippable.filter(
    (p) =>
      p.formality >= bandMin &&
      p.formality <= bandMax &&
      !isExcluded(p, c.exclusions),
  );

  // Widen the band once rather than fail when the catalog is thin.
  const covers = (list: Product[]) =>
    REQUIRED.every((cat) => list.some((p) => p.category === cat));
  if (!covers(eligible)) {
    eligible = shippable.filter(
      (p) =>
        p.formality >= bandMin - 1 &&
        p.formality <= bandMax + 1 &&
        !isExcluded(p, c.exclusions),
    );
  }

  if (!covers(eligible)) {
    return {
      ok: false,
      reason: "no_products_for_occasion",
      message: `We couldn't find a full set of pieces suitable for "${c.occasion}"${
        c.exclusions.length ? " with your exclusions applied" : ""
      }. Try a different occasion, or remove an exclusion.`,
      floorPrice: null,
    };
  }

  // 3. Budget feasibility on the TOTAL, not per item.
  const floors = REQUIRED.map(
    (cat) => cheapestIn(eligible.filter((p) => p.category === cat))!.price,
  );
  const floorPrice = floors.reduce((a, b) => a + b, 0);

  if (floorPrice > c.budget) {
    return {
      ok: false,
      reason: "budget_too_low",
      message: `We couldn't build a complete look for "${c.occasion}" within ${formatMoney(
        c.budget,
        c.currency,
      )}. The most affordable top, trousers, and shoes we can ship to ${
        c.location
      } come to ${formatMoney(floorPrice, c.currency)}. Raising the budget or choosing a more casual occasion should fix it.`,
      floorPrice,
    };
  }

  // 4. Drop items that can't fit in any complete outfit within budget: an item
  //    is only viable if it plus the cheapest of every other required category
  //    still fits.
  const floorByCat = new Map(
    REQUIRED.map((cat) => [
      cat,
      cheapestIn(eligible.filter((p) => p.category === cat))!.price,
    ]),
  );
  const viable = eligible.filter((p) => {
    let rest = 0;
    for (const cat of REQUIRED) {
      if (cat !== p.category) rest += floorByCat.get(cat)!;
    }
    return p.price + rest <= c.budget;
  });

  // 5. Rank by relevance, then price. Keep the set tight enough for a focused
  //    prompt while retaining depth in every category.
  const ranked = [...viable].sort(
    (a, b) => score(b, c) - score(a, c) || a.price - b.price,
  );

  const perCategoryCap = 14;
  const counts = new Map<Category, number>();
  const candidates = ranked.filter((p) => {
    const n = counts.get(p.category) ?? 0;
    if (n >= perCategoryCap) return false;
    counts.set(p.category, n + 1);
    return true;
  });

  return { ok: true, candidates, floorPrice };
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}
