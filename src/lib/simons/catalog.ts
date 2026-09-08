import "server-only";
import productsJson from "@/data/simons/products.json";
import type { Occasion, RequiredSlot, SimonsProduct } from "./types";

// ============================================================================
// Simons MVP catalog — data access.
//
// This is a static, bundled seed (src/data/simons/products.json), not a live
// feed. Two things follow from that, both required by
// src/data/simons/labeling_rules.md:
//
//   1. `active_for_pilot` items only — anything flagged unavailable or
//      discontinued during labeling is excluded at the source.
//   2. Nothing here is a stock/price guarantee. `availability_status` on
//      these rows is "indexed_current" (the page was current when the label
//      was written), not "live_verified". A real revalidation pass — hitting
//      simons.ca at request or display time — is NOT implemented; that is a
//      separate scraping/monitoring integration this module deliberately
//      does not attempt. Every consumer of this catalog must treat price and
//      availability as needing a final check on the retailer's own page
//      before a user acts on it — see needsRevalidation() below, used by the
//      UI to show that notice rather than silently presenting stale data as
//      current.
// ============================================================================

const ALL: SimonsProduct[] = (productsJson.products as SimonsProduct[]).filter(
  (p) => p.active_for_pilot !== false,
);

export function getSimonsCatalog(): SimonsProduct[] {
  return ALL;
}

export function getSimonsProductsBySlot(slot: RequiredSlot): SimonsProduct[] {
  return ALL.filter((p) => p.required_slot === slot);
}

export function getSimonsProductsForOccasion(
  slot: RequiredSlot,
  occasion: Occasion,
): SimonsProduct[] {
  return ALL.filter(
    (p) => p.required_slot === slot && p.labels.occasion_tags.includes(occasion),
  );
}

/**
 * True once a label is old enough that its price/availability should be
 * confirmed again before the item is trusted, per the labeling rules'
 * `next_review_at` field. Falls back to true (needs checking) if the date is
 * missing or unparseable — silence must never read as "confirmed current".
 */
export function needsRevalidation(product: SimonsProduct): boolean {
  if (!product.next_review_at) return true;
  const due = Date.parse(product.next_review_at);
  if (Number.isNaN(due)) return true;
  return Date.now() >= due;
}
