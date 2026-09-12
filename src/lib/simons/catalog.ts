import "server-only";
import catalogJson from "@/data/simons/products.json";
import type {
  Occasion,
  RequiredSlot,
  SimonsCatalogFile,
  SimonsMatchingContract,
  SimonsProduct,
} from "./types";

// ============================================================================
// Simons catalog (schema v2) — data access.
//
// Static, bundled seed. Two rules from the matching contract are enforced
// here rather than left to callers:
//
//   HARD FILTERS (matching_contract.hard_filters) — an item must have
//   active_for_pilot, a valid Simons product_url, a required_slot, and the
//   requested occasion in its occasion_tags. Nothing else is a hard filter.
//
//   NEVER HARD FILTER ON (matching_contract.never_hard_filter_on) — unknown
//   attributes, un-selected variant colour, and missing material
//   composition. This catalog is full of nulls by design (42 of 50 items
//   need a variant chosen before colour is even knowable), so treating
//   absent data as disqualifying would empty the shelf. Unknowns are handled
//   in scoring instead: see similarity.ts, where they drop out of the
//   weighting rather than scoring zero.
// ============================================================================

const FILE = catalogJson as unknown as SimonsCatalogFile;

export const MATCHING_CONTRACT: SimonsMatchingContract = FILE.matching_contract;
export const CATALOG_VERSION = FILE.catalog_version;
export const CATALOG_SCOPE = FILE.catalog_scope;

/**
 * Blocking overdue items is off by default.
 *
 * Every one of the 50 seeded products is currently `review_overdue` — the
 * snapshot's next_review_at has passed and there is no revalidation pipeline
 * yet. Enforcing "items marked review_overdue must be refreshed" as a hard
 * filter today would empty the catalog and the app would compose nothing at
 * all, so the default is to surface the staleness loudly at display time
 * instead (see isStale / needsRevalidation, rendered as a per-item warning).
 *
 * Set SIMONS_BLOCK_OVERDUE=1 to switch to the strict reading — correct once
 * a refresh pipeline exists and before any real public launch.
 */
function blockOverdue(): boolean {
  return process.env.SIMONS_BLOCK_OVERDUE === "1";
}

const URL_OK = /^https:\/\/(www|m)\.simons\.ca\//;

/** The hard filters named in matching_contract.hard_filters, and nothing more. */
function passesHardFilters(p: SimonsProduct): boolean {
  if (!p.commerce.active_for_pilot) return false;
  if (!p.commerce.product_url || !URL_OK.test(p.commerce.product_url)) return false;
  if (!p.classification.required_slot) return false;
  if (blockOverdue() && p.commerce.freshness_status === "review_overdue") return false;
  return true;
}

const ELIGIBLE: SimonsProduct[] = FILE.products.filter(passesHardFilters);

export function getSimonsCatalog(): SimonsProduct[] {
  return ELIGIBLE;
}

export function getSimonsProductsBySlot(slot: RequiredSlot): SimonsProduct[] {
  return ELIGIBLE.filter((p) => p.classification.required_slot === slot);
}

export function getSimonsProductsForOccasion(
  slot: RequiredSlot,
  occasion: Occasion,
): SimonsProduct[] {
  return ELIGIBLE.filter(
    (p) =>
      p.classification.required_slot === slot &&
      p.matching_profile.occasion_tags.includes(occasion),
  );
}

/**
 * True when this item's commercial snapshot is past its review date, or its
 * review date is missing/unparseable. Silence never reads as "confirmed
 * current" — the fallback is always "needs checking".
 */
export function needsRevalidation(product: SimonsProduct): boolean {
  if (product.commerce.freshness_status === "review_overdue") return true;
  const due = product.commerce.next_review_at;
  if (!due) return true;
  const ts = Date.parse(due);
  if (Number.isNaN(ts)) return true;
  return Date.now() >= ts;
}

/** True when the shopper must still pick a colour/size on the retailer's page. */
export function needsVariantSelection(product: SimonsProduct): boolean {
  return product.variant.variant_selection_required;
}

/** Counts for the validator and for surfacing catalog health. */
export function catalogHealth() {
  const overdue = FILE.products.filter(
    (p) => p.commerce.freshness_status === "review_overdue",
  ).length;
  return {
    catalogVersion: CATALOG_VERSION,
    total: FILE.products.length,
    eligible: ELIGIBLE.length,
    overdue,
    blockingOverdue: blockOverdue(),
  };
}
