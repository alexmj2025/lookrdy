import "server-only";
import type { Bundle, Category, Product } from "@/lib/types";
import type { SimonsOutfit, SimonsOutfitItem } from "./compose";
import type { BudgetRole, LookRole, RequiredSlot, SimonsProduct } from "./types";

// ============================================================================
// Bridges the Simons domain onto the generic Bundle/Product shape the rest of
// the app renders (/looks, /looks/[id], visualize()). One place to answer
// "what does a Simons item look like to everything downstream".
// ============================================================================

/** The generic Category enum has no separate blazer/coat/knit bucket. */
function toCategory(slot: RequiredSlot): Category {
  if (slot === "top") return "top";
  if (slot === "bottom") return "trousers";
  if (slot === "footwear") return "shoes";
  // optional_layer: blazer | jacket | coat | knit_layer all collapse into the
  // one layer bucket the generic type has.
  return "jacket";
}

function budgetRoleToTier(role: BudgetRole): Product["tier"] {
  if (role === "value" || role === "backup_sale") return "value";
  if (role === "stretch") return "premium";
  return "mid";
}

/**
 * Colour shown to the shopper. 42 of 50 items need a variant chosen before
 * colour is knowable, so this says "several colours" rather than inventing
 * one — asserting a colour we haven't confirmed would be exactly the claim
 * the matching contract's negative_constraints forbid.
 */
function describeColor(p: SimonsProduct): string {
  const v = p.visual_attributes.color;
  if (v.primary_name) return v.primary_name;
  if (p.variant.selected_color) return p.variant.selected_color;
  if (p.variant.variant_selection_required) return "Several colours";
  return v.primary_family ?? "";
}

function toProduct(item: SimonsOutfitItem): Product {
  const p = item.product;
  const brand = p.identity.brand;
  return {
    id: p.product_id,
    retailer: p.identity.retailer,
    // The generic Product type has no brand field, and the row renders
    // `retailer` where a shopper expects the brand (Le 31, Steve Madden...).
    // Folding it into the name rather than dropping it — "Simons" alone on
    // every row hides information the catalog already carries.
    name: brand && brand !== p.identity.retailer ? `${brand} — ${p.identity.title}` : p.identity.title,
    category: toCategory(p.classification.required_slot),
    color: describeColor(p),
    styleTags: p.matching_profile.style_tags ?? [],
    formality: p.matching_profile.formality_level_1_to_5,
    price: p.commerce.current_price,
    currency: p.commerce.currency,
    // The rights gate: no Simons imagery is authorized for display, and
    // media.product_image_url is null by design across the whole catalog.
    imageUrl: "",
    productUrl: p.commerce.product_url,
    countries: [p.classification.market],
    // The catalog carries no size list; leaving this empty is honest, and
    // inventing sizes would be a false availability claim.
    sizes: [],
    lastChecked: p.commerce.source_checked_at,
    tier: budgetRoleToTier(p.matching_profile.budget_role),
    // No affiliate relationship yet — the outbound link gets rel="nofollow".
    affiliateApproved: p.rights.affiliate_approved,
    needsRecheck: item.needsRecheck,
  };
}

const ROLE_COPY: Record<LookRole, { name: string; rationale: string }> = {
  Safe: {
    name: "Safe",
    rationale: "Neutral, considered pieces — nothing here to second-guess.",
  },
  Polished: {
    name: "Polished",
    rationale: "A little more colour or texture, still easy to wear.",
  },
  Bold: {
    name: "Bold",
    rationale: "One statement piece, kept in check by the rest of the outfit.",
  },
};

/**
 * `outfit.role` decides the outfit's identity and copy. `preferredRole`, if
 * the user picked one, decides which single outfit is flagged `recommended`
 * — exactly one, always.
 */
export function simonsOutfitToBundle(
  outfit: SimonsOutfit,
  index: number,
  preferredRole: LookRole | null,
): Bundle {
  const copy = ROLE_COPY[outfit.role];
  return {
    id: `look-${index + 1}`,
    name: copy.name,
    descriptors: [outfit.role],
    rationale: copy.rationale,
    recommended: preferredRole ? outfit.role === preferredRole : index === 0,
    items: [outfit.top, outfit.bottom, outfit.footwear].map(toProduct),
    total: outfit.baseTotal,
    layers: outfit.layers.length ? outfit.layers.map(toProduct) : undefined,
  };
}

export function simonsOutfitsToBundles(
  outfits: SimonsOutfit[],
  preferredRole: LookRole | null,
): Bundle[] {
  const bundles = outfits.map((o, i) => simonsOutfitToBundle(o, i, preferredRole));

  // Guarantee exactly one recommended, even when the preferred role isn't
  // among the outfits the catalog could actually produce this time.
  if (!bundles.some((b) => b.recommended) && bundles.length > 0) {
    bundles[0].recommended = true;
  }
  return bundles;
}
