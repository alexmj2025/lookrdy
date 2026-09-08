import "server-only";
import type { Bundle, Category, Product } from "@/lib/types";
import type { SimonsOutfit, SimonsOutfitItem } from "./compose";
import type { CanonicalCategory, LookRole, RequiredSlot, SimonsProduct } from "./types";

// ============================================================================
// Bridges the Simons domain (SimonsProduct / SimonsOutfit) onto the generic
// Bundle/Product shape the rest of the app — /looks, /looks/[id],
// visualize() — already knows how to render. Kept as its own module rather
// than folded into compose.ts so the "what does a Simons item look like to
// the rest of the app" question lives in one place.
// ============================================================================

/** The generic Category enum has no separate blazer/coat/knit bucket. */
function toCategory(slot: RequiredSlot, canonical: CanonicalCategory): Category {
  if (slot === "top") return "top";
  if (slot === "bottom") return "trousers";
  if (slot === "shoes") return "shoes";
  // optional_layer: blazer | jacket | coat | knit_layer all map to the one
  // layer bucket the generic type has.
  return "jacket";
}

function toProduct(item: SimonsOutfitItem): Product {
  const p = item.product;
  return {
    id: p.product_id,
    retailer: p.retailer,
    // The generic Product type has no separate brand field, and ProductMatchRow
    // renders `retailer` where a shopper expects to see the designer/brand
    // (Le 31, Steve Madden, ...). Folding it into the name rather than
    // dropping it — "Simons" alone, repeated on every row, would hide real
    // information the label already carries.
    name: p.brand && p.brand !== p.retailer ? `${p.brand} — ${p.title}` : p.title,
    category: toCategory(p.required_slot, p.canonical_category),
    color: p.listed_color ?? p.labels.preferred_color_family,
    styleTags: p.labels.style_tags ?? [],
    formality: p.labels.formality,
    price: p.current_price,
    currency: p.currency,
    // The rights gate: no Simons product imagery is authorized for display.
    // ProductMatchRow already renders nothing when this is empty.
    imageUrl: "",
    productUrl: p.url,
    countries: ["CA"],
    // The schema doesn't carry a size list — leaving this empty is honest;
    // inventing sizes would be a false availability claim.
    sizes: [],
    lastChecked: p.source_checked_at,
    tier: budgetRoleToTier(p.labels.budget_role),
    // Not an affiliate relationship yet — the outbound link gets nofollow.
    affiliateApproved: false,
    needsRecheck: item.needsRecheck,
  };
}

function budgetRoleToTier(role: SimonsProduct["labels"]["budget_role"]): Product["tier"] {
  if (role === "value" || role === "backup_sale") return "value";
  if (role === "stretch") return "premium";
  return "mid";
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
 * the user picked one in step 5, decides which single outfit is flagged
 * `recommended` — exactly one, always, matching the invariant the rest of
 * the app relies on (see the generic composer's same guarantee).
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
    items: [outfit.top, outfit.bottom, outfit.shoes].map(toProduct),
    total: outfit.baseTotal,
    layers: outfit.layers.length ? outfit.layers.map(toProduct) : undefined,
  };
}

export function simonsOutfitsToBundles(
  outfits: SimonsOutfit[],
  preferredRole: LookRole | null,
): Bundle[] {
  const bundles = outfits.map((o, i) => simonsOutfitToBundle(o, i, preferredRole));

  // Guarantee exactly one recommended, even if the preferred role wasn't
  // among the outfits the catalog could actually produce this time.
  if (!bundles.some((b) => b.recommended) && bundles.length > 0) {
    bundles[0].recommended = true;
  }
  return bundles;
}
