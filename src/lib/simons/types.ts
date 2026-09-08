// Domain types for the Simons MVP catalog.
//
// This mirrors src/data/simons/product.schema.json field-for-field. Kept
// separate from the generic multi-retailer Product type in src/lib/types.ts
// on purpose — see src/lib/simons/compose.ts for why the two catalogs aren't
// merged into one model.

export type RequiredSlot = "top" | "bottom" | "shoes" | "optional_layer";

export type CanonicalCategory =
  | "shirt"
  | "pants"
  | "footwear"
  | "knit_layer"
  | "blazer"
  | "jacket"
  | "coat";

export type Occasion =
  | "company_dinner"
  | "date_upscale_dinner"
  | "everyday_upgrade";

export type LookRole = "Safe" | "Polished" | "Bold";

export type BudgetRole = "value" | "core" | "stretch" | "optional" | "backup_sale";

export type SaleStatus = "regular" | "sale" | "unknown";

export type AvailabilityStatus =
  | "indexed_current"
  | "live_verified"
  | "unavailable"
  | "discontinued"
  | "unknown";

export interface SimonsProductLabels {
  preferred_color_family: string;
  pattern: string;
  fit: string;
  formality: number;
  warmth: number;
  season_tags: string[];
  occasion_tags: Occasion[];
  look_roles: LookRole[];
  style_tags?: string[];
  budget_role: BudgetRole;
}

export interface SimonsProductQuality {
  confidence: number;
  needs_review: boolean;
  review_reasons: string[];
  source_basis?: string;
}

export interface SimonsProductRights {
  image_use_authorized: boolean;
  affiliate_approved: boolean;
  public_display_allowed: boolean;
  link_out_only: boolean;
}

export interface SimonsProduct {
  product_id: string;
  retailer: "Simons";
  title: string;
  brand: string;
  url: string;
  regular_price?: number;
  current_price: number;
  currency: "CAD";
  sale_status?: SaleStatus;
  availability_status?: AvailabilityStatus;
  source_checked_at: string;
  next_review_at?: string;
  listed_color?: string;
  canonical_category: CanonicalCategory;
  subcategory?: string;
  required_slot: RequiredSlot;
  labels: SimonsProductLabels;
  quality?: SimonsProductQuality;
  rights: SimonsProductRights;
  active_for_pilot?: boolean;
}
