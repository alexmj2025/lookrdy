import "server-only";
import { getSimonsProductsForOccasion, needsRevalidation, needsVariantSelection } from "./catalog";
import { bandFor, scoreSimilarity, targetForRole } from "./similarity";
import type { SimilarityResult } from "./similarity";
import { BASE_MAX, BASE_MIN } from "./types";
import type { LookRole, Occasion, SimonsProduct } from "./types";

// ============================================================================
// Outfit composer — deterministic, rule-driven, no LLM.
//
//   - Base outfit = exactly one top + one bottom + one footwear item.
//   - Base total lands in CAD 200-450 (catalog_scope.base_outfit_budget_cad),
//     optionally narrowed further by the user.
//   - Optional layers are priced and returned SEPARATELY and never counted
//     toward the base total.
//   - Regular-price items are preferred; sale items are a backup.
//   - Safe / Polished / Bold comes from the intersection of the three base
//     items' own look_roles. Within a role, candidates are ordered by
//     similarity to that role's look direction (see similarity.ts) rather
//     than by price alone.
//
// Occasion eligibility is decided purely by the catalog's occasion_tags. v1
// additionally hard-coded a formality >= 3 floor for company dinner; v2's
// tags already encode that (every company-dinner top and bottom is
// formality >= 3, and casual footwear is excluded), so the override is gone
// — overriding curated data in code would now silently contradict it.
// ============================================================================

export { BASE_MIN, BASE_MAX };

export interface SimonsOutfitItem {
  product: SimonsProduct;
  /** Label is due (or overdue) a fresh price/stock check. */
  needsRecheck: boolean;
  /** Colour/size must still be chosen on the retailer's page. */
  needsVariant: boolean;
  /** Similarity to the look direction, 0-1, or null when unscoreable. */
  matchScore: number | null;
  /** Confidence band, already capped by how much was actually evaluable. */
  matchBand: SimilarityResult["band"];
}

export interface SimonsOutfit {
  role: LookRole;
  occasion: Occasion;
  top: SimonsOutfitItem;
  bottom: SimonsOutfitItem;
  footwear: SimonsOutfitItem;
  /** top + bottom + footwear current_price. Always within the budget band. */
  baseTotal: number;
  usedSaleItem: boolean;
  /** Mean of the three base items' similarity scores, when scoreable. */
  outfitScore: number | null;
  /** Weakest band across the base items — an outfit is only as good as its worst piece. */
  outfitBand: SimilarityResult["band"];
  /** Optional layers, priced separately from baseTotal. */
  layers: SimonsOutfitItem[];
}

function toItem(
  product: SimonsProduct,
  match: SimilarityResult | null,
): SimonsOutfitItem {
  return {
    product,
    needsRecheck: needsRevalidation(product),
    needsVariant: needsVariantSelection(product),
    matchScore: match?.score ?? null,
    matchBand: match?.band ?? "unscored",
  };
}

const price = (p: SimonsProduct) => p.commerce.current_price;
const isSale = (p: SimonsProduct) => p.commerce.sale_status === "sale";

/**
 * True if any comma/newline-separated term in the user's "anything to avoid"
 * text appears in the item's visible or descriptive attributes. A plain
 * substring match, so it behaves predictably rather than surprisingly.
 */
function isAvoided(product: SimonsProduct, avoidText: string): boolean {
  const terms = avoidText
    .split(/[,\n]| and /i)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 2);
  if (terms.length === 0) return false;

  const v = product.visual_attributes;
  const haystack = [
    product.identity.title,
    product.identity.brand,
    product.classification.subcategory,
    v.color.primary_family,
    v.color.primary_name,
    v.pattern.type,
    v.material.primary_family,
    v.material.fabric_type,
    v.silhouette.fit,
    ...(product.matching_profile.style_tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.some((t) => haystack.includes(t));
}

/** Ranks a slot's candidates against the role's look direction, best first. */
function rankForRole(
  products: SimonsProduct[],
  role: LookRole,
  formality: number,
): { product: SimonsProduct; match: SimilarityResult }[] {
  const target = targetForRole(role, formality);
  return products
    .map((product) => ({ product, match: scoreSimilarity(product, target) }))
    .sort((a, b) => {
      // Regular price first (a business rule, not a preference), then
      // similarity, then cheaper.
      const saleDiff = Number(isSale(a.product)) - Number(isSale(b.product));
      if (saleDiff !== 0) return saleDiff;
      const sa = a.match.score ?? 0;
      const sb = b.match.score ?? 0;
      if (Math.abs(sa - sb) > 0.02) return sb - sa;
      return price(a.product) - price(b.product);
    });
}

/** Typical formality for an occasion, used as the target's formality anchor. */
const OCCASION_FORMALITY: Record<Occasion, number> = {
  company_dinner: 4,
  date_upscale_dinner: 4,
  everyday_upgrade: 3,
};

export function composeSimonsOutfits(
  occasion: Occasion,
  opts: { budgetMin?: number; budgetMax?: number; avoidText?: string } = {},
): SimonsOutfit[] {
  const band = {
    min: Math.max(BASE_MIN, Math.min(opts.budgetMin ?? BASE_MIN, BASE_MAX)),
    max: Math.min(BASE_MAX, Math.max(opts.budgetMax ?? BASE_MAX, BASE_MIN)),
  };

  const avoid = opts.avoidText?.trim() ?? "";
  const keep = (p: SimonsProduct) => !avoid || !isAvoided(p, avoid);

  const tops = getSimonsProductsForOccasion("top", occasion).filter(keep);
  const bottoms = getSimonsProductsForOccasion("bottom", occasion).filter(keep);
  const footwear = getSimonsProductsForOccasion("footwear", occasion).filter(keep);
  const layers = getSimonsProductsForOccasion("optional_layer", occasion).filter(keep);

  const formality = OCCASION_FORMALITY[occasion];
  const used = new Set<string>();
  const outfits: SimonsOutfit[] = [];

  for (const role of ["Safe", "Polished", "Bold"] as const) {
    // Only items the catalog itself labels for this role are eligible; the
    // similarity score orders them, it doesn't admit them.
    const eligible = (list: SimonsProduct[]) =>
      list.filter(
        (p) => p.matching_profile.look_roles.includes(role) && !used.has(p.product_id),
      );

    const rankedTops = rankForRole(eligible(tops), role, formality);
    const rankedBottoms = rankForRole(eligible(bottoms), role, formality);
    const rankedFootwear = rankForRole(eligible(footwear), role, formality);
    if (!rankedTops.length || !rankedBottoms.length || !rankedFootwear.length) continue;

    // Best-ranked combination that fits the budget band. The lists are
    // already ordered, so the first fit is the best-ranked fit.
    let chosen: {
      top: (typeof rankedTops)[number];
      bottom: (typeof rankedBottoms)[number];
      footwear: (typeof rankedFootwear)[number];
      total: number;
    } | null = null;

    outer: for (const top of rankedTops) {
      for (const bottom of rankedBottoms) {
        for (const shoe of rankedFootwear) {
          const total = round2(
            price(top.product) + price(bottom.product) + price(shoe.product),
          );
          if (total >= band.min && total <= band.max) {
            chosen = { top, bottom, footwear: shoe, total };
            break outer;
          }
        }
      }
    }
    if (!chosen) continue;

    for (const part of [chosen.top, chosen.bottom, chosen.footwear]) {
      used.add(part.product.product_id);
    }

    const parts = [chosen.top, chosen.bottom, chosen.footwear];
    const scores = parts
      .map((p) => p.match.score)
      .filter((s): s is number => s !== null);
    const meanScore = scores.length
      ? round2(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    // An outfit is only as confident as its least-evaluable piece.
    const minCoverage = Math.min(...parts.map((p) => p.match.coverage));

    const layer = pickLayer(layers, role);

    outfits.push({
      role,
      occasion,
      top: toItem(chosen.top.product, chosen.top.match),
      bottom: toItem(chosen.bottom.product, chosen.bottom.match),
      footwear: toItem(chosen.footwear.product, chosen.footwear.match),
      baseTotal: chosen.total,
      usedSaleItem: parts.some((p) => isSale(p.product)),
      outfitScore: meanScore,
      outfitBand: bandFor(meanScore, minCoverage),
      layers: layer ? [layer] : [],
    });
  }

  return outfits;
}

/** The best-ranked optional layer for the role, if the occasion has one. */
function pickLayer(
  layers: SimonsProduct[],
  role: LookRole,
): SimonsOutfitItem | undefined {
  const eligible = layers.filter((p) => p.matching_profile.look_roles.includes(role));
  const pool = eligible.length ? eligible : layers;
  const ranked = rankForRole(pool, role, 3);
  const best = ranked[0];
  return best ? toItem(best.product, best.match) : undefined;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
