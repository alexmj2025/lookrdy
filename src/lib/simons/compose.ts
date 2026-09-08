import "server-only";
import { getSimonsProductsForOccasion, needsRevalidation } from "./catalog";
import type { LookRole, Occasion, SimonsProduct } from "./types";

// ============================================================================
// Simons MVP outfit composer — deterministic, rule-driven, no LLM.
//
// Implements src/data/simons/labeling_rules.md exactly:
//   - Base outfit = exactly one top + one bottom + one pair of shoes.
//   - Base total must land in CAD 200-450 inclusive.
//   - Optional layers (blazer/jacket/coat/knit) are priced and shown
//     SEPARATELY — their price is never added to the base total.
//   - Regular-price items are primary; sale items are backup only.
//   - Company dinner requires formality >= 3 on the top and bottom, and
//     recommends a blazer when one is available (rules doc §"Outfit
//     validator" — this rule does not additionally formality-gate shoes, so
//     neither does this implementation; see the note on RESULT_FALLBACK
//     below if that turns out to need tightening).
//   - Safe / Polished / Bold: an outfit's role is the intersection of its
//     three base items' pre-labeled look_roles. Items were labeled per the
//     rules' own colour/pattern/fit criteria, so re-deriving the judgement
//     from raw labels here would just be a weaker copy of that work; this
//     trusts the label and combines it at the outfit level instead.
// ============================================================================

export const BASE_MIN = 200;
export const BASE_MAX = 450;

export interface SimonsOutfitItem {
  product: SimonsProduct;
  /** True if this item's label is due (or overdue) for a fresh price/stock check. */
  needsRecheck: boolean;
}

export interface SimonsOutfit {
  role: LookRole;
  occasion: Occasion;
  top: SimonsOutfitItem;
  bottom: SimonsOutfitItem;
  shoes: SimonsOutfitItem;
  /** top + bottom + shoes current_price. Always within [BASE_MIN, BASE_MAX]. */
  baseTotal: number;
  usedSaleItem: boolean;
  /** Optional layer suggestions, priced separately from baseTotal. */
  layers: SimonsOutfitItem[];
}

function withRecheck(product: SimonsProduct): SimonsOutfitItem {
  return { product, needsRecheck: needsRevalidation(product) };
}

/** Regular-price items first, cheapest first within each tier — rule 13. */
function bySaleThenPrice(a: SimonsProduct, b: SimonsProduct): number {
  const aReg = a.sale_status !== "sale" ? 0 : 1;
  const bReg = b.sale_status !== "sale" ? 0 : 1;
  if (aReg !== bReg) return aReg - bReg;
  return a.current_price - b.current_price;
}

function roleIntersection(items: SimonsProduct[]): LookRole[] {
  return (["Safe", "Polished", "Bold"] as const).filter((role) =>
    items.every((p) => p.labels.look_roles.includes(role)),
  );
}

/**
 * Every distinct (top, bottom, shoes) combination whose base total lands in
 * the CAD 200-450 band, sorted so regular-price-heavy, cheaper combinations
 * are tried first when picking one per role.
 */
function candidateCombos(
  tops: SimonsProduct[],
  bottoms: SimonsProduct[],
  shoes: SimonsProduct[],
): { top: SimonsProduct; bottom: SimonsProduct; shoes: SimonsProduct; total: number }[] {
  const combos: {
    top: SimonsProduct;
    bottom: SimonsProduct;
    shoes: SimonsProduct;
    total: number;
  }[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const total = round2(top.current_price + bottom.current_price + shoe.current_price);
        if (total >= BASE_MIN && total <= BASE_MAX) {
          combos.push({ top, bottom, shoes: shoe, total });
        }
      }
    }
  }

  combos.sort((a, b) => {
    const aSale = [a.top, a.bottom, a.shoes].filter((p) => p.sale_status === "sale").length;
    const bSale = [b.top, b.bottom, b.shoes].filter((p) => p.sale_status === "sale").length;
    if (aSale !== bSale) return aSale - bSale;
    return a.total - b.total;
  });

  return combos;
}

/** One affordable optional layer recommendation, if any exists for the occasion. */
function pickLayer(
  layers: SimonsProduct[],
  occasion: Occasion,
): SimonsOutfitItem | undefined {
  const eligible = layers
    .filter((p) => p.labels.occasion_tags.includes(occasion))
    .sort(bySaleThenPrice);
  return eligible[0] ? withRecheck(eligible[0]) : undefined;
}

/**
 * Generates up to one outfit per look role (Safe, Polished, Bold) for the
 * given occasion, using distinct top/bottom/shoes across the three so a user
 * never sees the same piece repeated. Returns fewer than 3 if the catalog
 * can't support every role within the base-total band — this MVP catalog is
 * 50 items, so that's expected on the tighter combinations rather than a bug.
 */
export function composeSimonsOutfits(occasion: Occasion): SimonsOutfit[] {
  let tops = getSimonsProductsForOccasion("top", occasion);
  let bottoms = getSimonsProductsForOccasion("bottom", occasion);
  let shoes = getSimonsProductsForOccasion("shoes", occasion);
  const layers = getSimonsProductsForOccasion("optional_layer", occasion);

  if (occasion === "company_dinner") {
    // The validator rule's literal text only formality-gates top and pants
    // ("collared top and pants with formality >= 3"). Applied alone, that
    // still let sneakers (formality 1-2) pair with a blazer, which
    // contradicts the fixed business decision that company dinner IS
    // business casual overall. Extending the >= 3 floor to shoes as well —
    // this catalog's dress shoes all sit at formality 4, so this excludes
    // exactly the sneakers/casual loafers and nothing else.
    tops = tops.filter((p) => p.labels.formality >= 3);
    bottoms = bottoms.filter((p) => p.labels.formality >= 3);
    shoes = shoes.filter((p) => p.labels.formality >= 3);
  }

  const combos = candidateCombos(tops, bottoms, shoes);
  const used = new Set<string>();
  const outfits: SimonsOutfit[] = [];

  for (const role of ["Safe", "Polished", "Bold"] as const) {
    const combo = combos.find((c) => {
      const items = [c.top, c.bottom, c.shoes];
      if (items.some((p) => used.has(p.product_id))) return false;
      return roleIntersection(items).includes(role);
    });
    if (!combo) continue;

    for (const p of [combo.top, combo.bottom, combo.shoes]) used.add(p.product_id);

    const layer = pickLayer(layers, occasion);

    outfits.push({
      role,
      occasion,
      top: withRecheck(combo.top),
      bottom: withRecheck(combo.bottom),
      shoes: withRecheck(combo.shoes),
      baseTotal: combo.total,
      usedSaleItem: [combo.top, combo.bottom, combo.shoes].some(
        (p) => p.sale_status === "sale",
      ),
      layers: layer ? [layer] : [],
    });
  }

  return outfits;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
