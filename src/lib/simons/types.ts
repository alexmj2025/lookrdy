// Domain types for the Simons catalog, schema v2.0.0.
//
// Mirrors src/data/simons/product.schema.json. The v2 shape groups what v1
// kept flat: identity / commerce / classification / variant / media /
// visual_attributes / matching_profile / data_quality / rights. Two renames
// matter downstream: v1 `url` is now `commerce.product_url`, and the
// `shoes` slot is now `footwear`.

// Deliberately NOT gated behind "server-only" — unlike catalog.ts and
// compose.ts, these are pure values and types that client components (the
// budget slider and its validation) import directly.
export const BASE_MIN = 200;
export const BASE_MAX = 450;

export type RequiredSlot = "top" | "bottom" | "footwear" | "optional_layer";

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

export type BudgetRole =
  | "value"
  | "core"
  | "stretch"
  | "optional"
  | "backup_sale";

export type SaleStatus = "regular" | "sale" | "unknown";

export type FreshnessStatus = "current" | "review_due" | "review_overdue";

/** The weight buckets in matching_contract.category_weights are keyed by these. */
export type WeightCategory = "shirt" | "pants" | "footwear" | "optional_layer";

export interface SimonsIdentity {
  retailer: string;
  brand: string;
  title: string;
}

export interface SimonsCommerce {
  product_url: string;
  currency: "CAD";
  regular_price: number;
  current_price: number;
  sale_status: SaleStatus;
  availability_status: string;
  source_checked_at: string;
  next_review_at: string;
  freshness_status: FreshnessStatus;
  active_for_pilot: boolean;
}

export interface SimonsClassification {
  market: string;
  department: string;
  age_group?: string;
  canonical_category: CanonicalCategory;
  subcategory: string;
  required_slot: RequiredSlot;
}

export interface SimonsVariant {
  listed_color: string | null;
  selected_color: string | null;
  selected_size: string | null;
  variant_selection_required: boolean;
  attribute_reference_color: string | null;
  color_attributes_are_variant_specific: boolean;
}

export interface SimonsMedia {
  product_image_url: string | null;
  image_required_for_generation: boolean;
  image_display_authorized: boolean;
  display_mode: string;
}

export interface SimonsVisualAttributes {
  color: {
    primary_family: string | null;
    primary_name: string | null;
    secondary_families: string[];
    contrast: string | null;
    palette_role: string | null;
  };
  pattern: {
    type: string | null;
    scale: string | null;
    direction: string | null;
    density: string | null;
    contrast: string | null;
    visual_salience: string | null;
  };
  material: {
    primary_family: string | null;
    fabric_type: string | null;
    composition: string[];
    texture: string | null;
    surface_finish: string | null;
    weight: string | null;
  };
  silhouette: {
    fit: string | null;
    volume: string | null;
    structure: string | null;
    length: string | null;
    drape: string | null;
    leg_shape?: string | null;
    rise?: string | null;
    pleats?: string | null;
  };
  construction: {
    garment_type: string | null;
    collar?: string | null;
    sleeve_length?: string | null;
    closure?: string | null;
    pockets?: string[];
    cuff?: string | null;
    hem?: string | null;
    back_detail?: string | null;
    toe_shape?: string | null;
    sole?: string | null;
  };
  styling: {
    wear_methods: string[];
    layering_role: string | null;
    tuck_compatibility?: string | null;
  };
}

export interface SimonsMatchingProfile {
  formality_level_1_to_5: number;
  warmth_level_1_to_5: number;
  season_tags: string[];
  occasion_tags: Occasion[];
  look_roles: LookRole[];
  style_tags: string[];
  budget_role: BudgetRole;
  /** Dot-paths into the product that matter most when ranking similarity. */
  match_priority_fields: string[];
  negative_constraints: string[];
}

export interface SimonsDataQuality {
  commercial_data_confidence: number;
  visual_attribute_confidence: number;
  source_basis?: string;
  verified_fields: string[];
  inferred_fields: string[];
  unknown_or_variant_fields: string[];
  needs_review: boolean;
  review_reasons: string[];
}

export interface SimonsRights {
  image_use_authorized: boolean;
  affiliate_approved: boolean;
  public_display_allowed: boolean;
  link_out_only: boolean;
}

export interface SimonsProduct {
  product_id: string;
  schema_version: string;
  identity: SimonsIdentity;
  commerce: SimonsCommerce;
  classification: SimonsClassification;
  variant: SimonsVariant;
  media: SimonsMedia;
  visual_attributes: SimonsVisualAttributes;
  matching_profile: SimonsMatchingProfile;
  data_quality: SimonsDataQuality;
  rights: SimonsRights;
}

export interface SimonsMatchingContract {
  purpose: string;
  exact_product_replication_required: boolean;
  product_image_required_for_generation: boolean;
  hard_filters: string[];
  never_hard_filter_on: string[];
  category_weights: Record<WeightCategory, Record<string, number>>;
  score_interpretation: Record<string, string>;
  output_copy_rule: string;
}

export interface SimonsCatalogFile {
  catalog_id: string;
  schema_version: string;
  catalog_version: string;
  generated_at?: string;
  product_count: number;
  catalog_scope: {
    base_outfit_budget_cad: {
      minimum: number;
      maximum: number;
      optional_layers_excluded: boolean;
    };
    occasions: Occasion[];
    look_roles: LookRole[];
    base_outfit_slots: string[];
  };
  matching_contract: SimonsMatchingContract;
  products: SimonsProduct[];
}
