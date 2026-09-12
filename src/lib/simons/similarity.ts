import "server-only";
import { MATCHING_CONTRACT } from "./catalog";
import type {
  LookRole,
  SimonsProduct,
  WeightCategory,
} from "./types";

// ============================================================================
// Similarity ranking.
//
// Implements matching_contract: a candidate product is scored against a
// LOOK DIRECTION, not against an exact garment. The weights come from
// matching_contract.category_weights, so tuning happens in the catalog file
// rather than in code.
//
// Two rules shape the maths:
//
//   1. Unknown attributes never penalize. This catalog is deliberately full
//      of nulls (colour is unknowable until a variant is selected on 42 of
//      50 items). A missing value drops its weight out of BOTH sides of the
//      ratio rather than scoring zero — otherwise sparse-but-appropriate
//      items would lose to fully-specified but less suitable ones, which is
//      the "never_hard_filter_on: unknown attributes" rule expressed as
//      arithmetic.
//
//   2. Nothing here is a filter. Scores rank; they never exclude. The only
//      exclusions live in catalog.ts's hard filters.
// ============================================================================

/**
 * A target look direction. Keys are deliberately the same names as
 * matching_contract.category_weights, so a weight always has an obvious
 * corresponding target field and the two can't drift apart.
 *
 * A value may be a single acceptable value, a list of acceptable values
 * (scored 1 if the candidate matches any), or a number (scored by proximity).
 */
export type LookTarget = Partial<Record<string, string | string[] | number>>;

export interface SimilarityResult {
  /** 0-1, or null when nothing could be evaluated (all inputs unknown). */
  score: number | null;
  /** Which weighted dimensions actually contributed. */
  evaluated: string[];
  /** Share of the category's total weight that was evaluable. */
  coverage: number;
  band: "strong" | "usable" | "fallback" | "reject" | "unscored";
}

/** Maps a weight key to the candidate's comparable value. */
const READERS: Record<string, (p: SimonsProduct) => unknown> = {
  category: (p) => p.classification.canonical_category,
  subcategory: (p) => p.classification.subcategory,
  color: (p) => p.visual_attributes.color.primary_family,
  pattern: (p) => p.visual_attributes.pattern.type,
  silhouette_fit: (p) => p.visual_attributes.silhouette.fit,
  silhouette: (p) => p.visual_attributes.silhouette.fit,
  material_fabric: (p) => p.visual_attributes.material.fabric_type,
  material: (p) => p.visual_attributes.material.primary_family,
  texture: (p) => p.visual_attributes.material.texture,
  collar_details: (p) => p.visual_attributes.construction.collar,
  collar: (p) => p.visual_attributes.construction.collar,
  closure: (p) => p.visual_attributes.construction.closure,
  toe_and_sole: (p) =>
    [
      p.visual_attributes.construction.toe_shape,
      p.visual_attributes.construction.sole,
    ].filter(Boolean) as string[],
  styling_method: (p) => p.visual_attributes.styling.wear_methods,
  leg_shape: (p) =>
    p.visual_attributes.silhouette.leg_shape ?? p.visual_attributes.silhouette.fit,
  rise: (p) => p.visual_attributes.silhouette.rise,
  pleats: (p) => p.visual_attributes.silhouette.pleats,
  formality: (p) => p.matching_profile.formality_level_1_to_5,
};

/** Which weight bucket applies to a product. */
export function weightCategoryFor(product: SimonsProduct): WeightCategory {
  const slot = product.classification.required_slot;
  if (slot === "optional_layer") return "optional_layer";
  if (slot === "footwear") return "footwear";
  if (slot === "bottom") return "pants";
  return "shirt";
}

function isBlank(v: unknown): boolean {
  return (
    v === null ||
    v === undefined ||
    v === "" ||
    v === "none" ||
    v === "unknown" ||
    (Array.isArray(v) && v.length === 0)
  );
}

/** 0-1 similarity for one dimension. */
function compare(candidate: unknown, target: string | string[] | number): number {
  if (typeof target === "number") {
    const c = typeof candidate === "number" ? candidate : Number(candidate);
    if (!Number.isFinite(c)) return 0;
    // Formality is a 1-5 scale, so 4 is the largest possible gap.
    return Math.max(0, 1 - Math.abs(c - target) / 4);
  }

  const accept = Array.isArray(target) ? target : [target];
  const acceptSet = new Set(accept.map((t) => String(t).toLowerCase()));

  if (Array.isArray(candidate)) {
    const vals = candidate.map((v) => String(v).toLowerCase());
    if (vals.length === 0) return 0;
    const hits = vals.filter((v) => acceptSet.has(v)).length;
    // Partial credit: any overlap counts, full overlap scores 1.
    return hits === 0 ? 0 : Math.min(1, hits / Math.min(vals.length, acceptSet.size));
  }

  return acceptSet.has(String(candidate).toLowerCase()) ? 1 : 0;
}

const BANDS = parseBands();

function parseBands() {
  // Thresholds live in matching_contract.score_interpretation (">=0.78",
  // "0.62-0.77", ...) so the catalog stays the source of truth.
  const si = MATCHING_CONTRACT.score_interpretation ?? {};
  const lowEdge = (raw: string | undefined, fallback: number) => {
    if (!raw) return fallback;
    const m = raw.match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : fallback;
  };
  return {
    strong: lowEdge(si.strong, 0.78),
    usable: lowEdge(si.usable, 0.62),
    fallback: lowEdge(si.fallback, 0.5),
  };
}

/**
 * Band for a score, capped by how much of the category's weight was actually
 * evaluable.
 *
 * Without this, an item scoring 1.0 on the two attributes we happen to know
 * reports "strong" even though 60%+ of what defines a match for its category
 * is unknown. That is exactly the kind of overclaiming the contract's
 * negative_constraints warn against, so thin evidence can't buy a confident
 * label no matter how well the known dimensions line up.
 */
export function bandFor(
  score: number | null,
  coverage = 1,
): SimilarityResult["band"] {
  if (score === null) return "unscored";

  let band: SimilarityResult["band"];
  if (score >= BANDS.strong) band = "strong";
  else if (score >= BANDS.usable) band = "usable";
  else if (score >= BANDS.fallback) band = "fallback";
  else band = "reject";

  if (coverage < 0.35 && band === "strong") band = "fallback";
  else if (coverage < 0.35 && band === "usable") band = "fallback";
  else if (coverage < 0.6 && band === "strong") band = "usable";

  return band;
}

/**
 * Scores one candidate against a target look direction using the weights for
 * its category. Returns `score: null` when the candidate carries none of the
 * target's dimensions — "we can't tell", which is different from "bad match".
 */
export function scoreSimilarity(
  product: SimonsProduct,
  target: LookTarget,
): SimilarityResult {
  const weights = MATCHING_CONTRACT.category_weights[weightCategoryFor(product)] ?? {};

  // match_priority_fields is the item's own statement of what matters most
  // about it; a dimension it names gets a modest boost so the item's own
  // labelling influences its ranking.
  const priority = new Set(
    product.matching_profile.match_priority_fields.map((f) => f.toLowerCase()),
  );
  const isPriority = (key: string) =>
    [...priority].some((f) => f.includes(key.replace(/_/g, ".")) || f.includes(key));

  let weighted = 0;
  let used = 0;
  let total = 0;
  const evaluated: string[] = [];

  for (const [key, rawWeight] of Object.entries(weights)) {
    total += rawWeight;

    const want = target[key];
    if (want === undefined) continue;

    const reader = READERS[key];
    if (!reader) continue;

    const have = reader(product);
    if (isBlank(have)) continue; // unknown: drops out of both sides

    const weight = rawWeight * (isPriority(key) ? 1.15 : 1);
    weighted += weight * compare(have, want);
    used += weight;
    evaluated.push(key);
  }

  const score = used > 0 ? weighted / used : null;
  const coverage = total > 0 ? used / total : 0;
  return { score, evaluated, coverage, band: bandFor(score, coverage) };
}

/**
 * The look direction each role implies, expressed in the same vocabulary the
 * weights use. These mirror the definitions the catalog itself encodes in
 * look_roles: Safe stays neutral and unpatterned, Polished allows texture or
 * a wider palette, Bold expects a statement.
 *
 * Role eligibility is still decided by the item's own `look_roles` array —
 * this only ranks within a role, it never overrides the label.
 */
export function targetForRole(role: LookRole, formality: number): LookTarget {
  const base: LookTarget = { formality };

  if (role === "Safe") {
    return {
      ...base,
      color: ["neutral", "dark_neutral", "light_neutral", "black", "white"],
      pattern: "solid",
      texture: ["smooth", "matte", "flat"],
    };
  }

  if (role === "Polished") {
    return {
      ...base,
      color: ["neutral", "dark_neutral", "expanded", "brown", "blue"],
      pattern: ["solid", "tonal_jacquard", "micro_dot", "corduroy"],
      texture: ["basketweave", "twill", "brushed", "ribbed", "corduroy"],
    };
  }

  return {
    ...base,
    color: ["expanded", "brown", "blue", "green", "burgundy"],
    pattern: ["stripe", "banker_stripe", "check", "gingham", "micro_dot", "tonal_jacquard"],
  };
}
