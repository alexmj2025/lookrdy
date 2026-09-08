// Shared domain types for Lookrdy.
//
// The pipeline order is encoded in these types: Constraints (step 1) feed
// retrieval (step 2), retrieval feeds Bundle composition (step 3), and only a
// composed Bundle can be visualized (step 4).

export type Category =
  | "jacket"
  | "top"
  | "trousers"
  | "shoes"
  | "bag"
  | "accessory";

export type Tier = "value" | "mid" | "premium";

export interface Product {
  id: string;
  retailer: string;
  name: string;
  category: Category;
  color: string;
  styleTags: string[];
  /** 1 = very casual … 5 = formal */
  formality: number;
  price: number;
  currency: string;
  imageUrl: string;
  /** Real, working retailer URL. */
  productUrl: string;
  /** ISO country codes where the retailer ships. */
  countries: string[];
  sizes: string[];
  /** ISO date the price/stock was last verified. */
  lastChecked: string;
  tier: Tier;
  /**
   * False when the outbound link goes to a retailer with no affiliate
   * relationship — the UI adds `rel="nofollow"` in that case rather than
   * implying an endorsement or earning attribution we haven't agreed to.
   * Undefined is treated as true (the historical default for this field).
   */
  affiliateApproved?: boolean;
  /** True when this item's price/availability label is due a fresh check. */
  needsRecheck?: boolean;
}

/** Step 1 output: the free-text request parsed into machine constraints. */
export interface Constraints {
  occasion: string;
  /** Inclusive formality band derived from the occasion. */
  formalityMin: number;
  formalityMax: number;
  /** Style tags to prefer when ranking candidates. */
  styleTags: string[];
  /** Colors to prefer, if the user expressed a preference. */
  colors: string[];
  /** Categories or descriptors the user explicitly ruled out. */
  exclusions: string[];
  budget: number;
  currency: string;
  location: string;
  /** ISO country code, or null when the location couldn't be resolved. */
  country: string | null;
  /** Categories every look must include. */
  requiredCategories: Category[];
}

export interface StyleRequest {
  occasion: string;
  desiredLook: string;
  budget: number;
  currency: string;
  location: string;
  exclusions: string;
}

/** Step 3 output: three of these per generation. */
export interface Bundle {
  id: string;
  name: string;
  descriptors: string[];
  rationale: string;
  recommended: boolean;
  items: Product[];
  total: number;
  /**
   * Optional layers (blazer/jacket/coat/knit), priced separately from
   * `total` and never folded into it — a base outfit's price must always be
   * exactly the sum of `items`, and this is where anything additional goes.
   */
  layers?: Product[];
}

/** Percentage-based hotspot box, relative to the rendered image. */
export interface HotspotZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Hotspot {
  productId: string;
  category: Category;
  zone: HotspotZone;
}

/** Step 4 output attached to each bundle. */
export interface Look extends Bundle {
  /** Data URL or hosted URL of the AI visualization. */
  imageUrl: string;
  hotspots: Hotspot[];
}

export interface GenerationResult {
  looks: Look[];
  constraints: Constraints;
  request: StyleRequest;
  engine: "openai" | "mock";
  generationsUsed: number;
  generationsAllowed: number;
}

export type GenerationError =
  | { error: "invalid_request"; message: string }
  | { error: "insufficient_catalog"; message: string }
  | { error: "limit_reached"; message: string }
  | { error: "engine_failure"; message: string };

export type FunnelEvent =
  | "landing"
  | "started"
  | "photo_uploaded"
  | "request_completed"
  | "generation_completed"
  | "look_selected"
  | "hotspot_opened"
  | "retailer_clicked"
  | "repeat_generation";
