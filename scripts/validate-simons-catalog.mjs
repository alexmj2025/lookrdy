/**
 * Validates the Simons catalog against its schema (v2.0.0).
 *
 *   node scripts/validate-simons-catalog.mjs                 # validate the bundled seed
 *   node scripts/validate-simons-catalog.mjs <file.json>     # validate an update before importing
 *
 * Hand-rolled rather than pulled in via ajv: the schema is small and fixed,
 * and this runs at import/review time, not per request. It checks the
 * schema's own required/enum/pattern rules AND the business rules the
 * catalog cannot express in JSON Schema (rights gates, budget feasibility,
 * freshness), because those are the ones that actually cause harm if wrong.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DIR = join(here, "..", "src", "data", "simons");

const schema = JSON.parse(readFileSync(join(DIR, "product.schema.json"), "utf8"));
const target = process.argv[2]
  ? resolve(process.argv[2])
  : join(DIR, "products.json");
const catalog = JSON.parse(readFileSync(target, "utf8"));

const errors = [];
const warnings = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

// --- Envelope ---------------------------------------------------------------

for (const field of schema.required) {
  if (catalog[field] === undefined) fail("catalog", `missing required field "${field}"`);
}
if (catalog.schema_version !== "2.0.0") {
  fail("catalog", `schema_version must be "2.0.0", got "${catalog.schema_version}"`);
}
if (!Array.isArray(catalog.products) || catalog.products.length === 0) {
  fail("catalog", "products must be a non-empty array");
  report();
}
if (catalog.product_count !== catalog.products.length) {
  fail(
    "catalog",
    `product_count ${catalog.product_count} != actual ${catalog.products.length}`,
  );
}

const itemSchema = schema.properties.products.items;
const PRODUCT_URL_RE = /^https:\/\/(www|m)\.simons\.ca\//;
const ID_RE = /^SIM-[0-9]{3}$/;

const seenIds = new Set();
const bySlot = {};
const freshness = {};

for (const p of catalog.products) {
  const id = p.product_id ?? "(missing product_id)";

  // Required groups, straight from the schema.
  for (const field of itemSchema.required) {
    if (p[field] === undefined || p[field] === null) {
      fail(id, `missing required group "${field}"`);
    }
  }

  if (!ID_RE.test(p.product_id ?? "")) fail(id, `product_id fails ${ID_RE}`);
  if (seenIds.has(p.product_id)) fail(id, "duplicate product_id");
  seenIds.add(p.product_id);
  if (p.schema_version !== "2.0.0") fail(id, `schema_version must be "2.0.0"`);

  // Nested required fields, straight from the schema.
  for (const [group, def] of Object.entries(itemSchema.properties)) {
    if (!def.required || !p[group]) continue;
    for (const field of def.required) {
      if (p[group][field] === undefined) fail(id, `${group}.${field} missing`);
    }
  }

  const c = p.commerce ?? {};
  if (c.product_url && !PRODUCT_URL_RE.test(c.product_url)) {
    fail(id, `product_url must be a simons.ca URL, got "${c.product_url}"`);
  }
  if (c.currency !== "CAD") fail(id, `currency must be "CAD", got "${c.currency}"`);
  for (const key of ["regular_price", "current_price"]) {
    if (typeof c[key] !== "number" || c[key] < 0) {
      fail(id, `commerce.${key} must be a number >= 0`);
    }
  }
  if (typeof c.active_for_pilot !== "boolean") {
    fail(id, "commerce.active_for_pilot must be boolean");
  }
  freshness[c.freshness_status] = (freshness[c.freshness_status] ?? 0) + 1;

  const slot = p.classification?.required_slot;
  bySlot[slot] = (bySlot[slot] ?? 0) + 1;
  if (!["top", "bottom", "footwear", "optional_layer"].includes(slot)) {
    fail(id, `classification.required_slot "${slot}" is not a known slot`);
  }

  const mp = p.matching_profile ?? {};
  const formality = mp.formality_level_1_to_5;
  if (!Number.isInteger(formality) || formality < 1 || formality > 5) {
    fail(id, `formality_level_1_to_5 ${formality} out of range 1-5`);
  }
  if (!Array.isArray(mp.occasion_tags) || mp.occasion_tags.length === 0) {
    fail(id, "occasion_tags must be a non-empty array");
  }
  for (const tag of mp.occasion_tags ?? []) {
    if (!["company_dinner", "date_upscale_dinner", "everyday_upgrade"].includes(tag)) {
      fail(id, `unknown occasion_tag "${tag}"`);
    }
  }
  for (const role of mp.look_roles ?? []) {
    if (!["Safe", "Polished", "Bold"].includes(role)) {
      fail(id, `unknown look_role "${role}"`);
    }
  }

  // --- Business rules the JSON Schema can't express -------------------------

  // Rights: until affiliate/image approval exists, nothing may be marked
  // displayable. Getting this wrong would publish retailer imagery we have
  // no licence for, so it's an error rather than a warning.
  const r = p.rights ?? {};
  if (r.image_use_authorized === true) fail(id, "rights.image_use_authorized must be false");
  if (r.public_display_allowed === true) fail(id, "rights.public_display_allowed must be false");
  if (r.link_out_only !== true) fail(id, "rights.link_out_only must be true");
  if (p.media?.product_image_url) fail(id, "media.product_image_url must be null (no stored retailer imagery)");
  if (p.media?.image_display_authorized === true) {
    fail(id, "media.image_display_authorized must be false");
  }

  if (c.freshness_status === "review_overdue") {
    warn(id, "commercial snapshot is past next_review_at — needs revalidation before display");
  }
}

// --- Catalog-level feasibility ----------------------------------------------

const budget = catalog.catalog_scope?.base_outfit_budget_cad ?? {};
const min = budget.minimum ?? 200;
const max = budget.maximum ?? 450;

for (const occasion of catalog.catalog_scope?.occasions ?? []) {
  const eligible = (slot) =>
    catalog.products.filter(
      (p) =>
        p.commerce?.active_for_pilot &&
        p.classification?.required_slot === slot &&
        (p.matching_profile?.occasion_tags ?? []).includes(occasion),
    );

  const slots = ["top", "bottom", "footwear"];
  const pools = slots.map(eligible);
  const missing = slots.filter((_, i) => pools[i].length === 0);
  if (missing.length) {
    fail("catalog", `${occasion}: no eligible items for slot(s) ${missing.join(", ")}`);
    continue;
  }

  const cheapest = pools.reduce(
    (sum, pool) => sum + Math.min(...pool.map((p) => p.commerce.current_price)),
    0,
  );
  const priciest = pools.reduce(
    (sum, pool) => sum + Math.max(...pool.map((p) => p.commerce.current_price)),
    0,
  );
  if (cheapest > max || priciest < min) {
    fail(
      "catalog",
      `${occasion}: no base outfit can land in CAD ${min}-${max} (range ${cheapest}-${priciest})`,
    );
  }
}

report();

function report() {
  console.log(`Catalog: ${catalog.catalog_id ?? "(no id)"} ${catalog.catalog_version ?? ""}`);
  console.log(`Schema:  ${catalog.schema_version}`);
  console.log(`Checked ${catalog.products?.length ?? 0} products from ${target}`);
  console.log("By required_slot:", bySlot);
  console.log("By freshness:", freshness);

  if (warnings.length) {
    const shown = warnings.slice(0, 5);
    console.warn(`\n${warnings.length} warning(s):`);
    for (const w of shown) console.warn(`  - ${w}`);
    if (warnings.length > shown.length) {
      console.warn(`  … and ${warnings.length - shown.length} more of the same kind`);
    }
  }

  if (errors.length) {
    console.error(`\n${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log("\nValid against product.schema.json (v2.0.0).");
  process.exit(0);
}
