/**
 * Validates src/data/simons/products.json against product.schema.json.
 *
 *   node scripts/validate-simons-catalog.mjs
 *
 * Hand-rolled rather than pulled in via ajv/zod: the schema is small and
 * fixed (required fields, enums, a couple of patterns and numeric ranges),
 * and this only needs to run at build/import time, not per request.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DIR = join(here, "..", "src", "data", "simons");

const schema = JSON.parse(readFileSync(join(DIR, "product.schema.json"), "utf8"));
const catalog = JSON.parse(readFileSync(join(DIR, "products.json"), "utf8"));

const errors = [];
const warn = (id, msg) => errors.push(`${id}: ${msg}`);

function checkEnum(id, field, value, allowed) {
  if (value !== undefined && !allowed.includes(value)) {
    warn(id, `${field}="${value}" not in [${allowed.join(", ")}]`);
  }
}

function checkType(id, field, value, type) {
  if (value === undefined) return;
  const actual = Array.isArray(value) ? "array" : typeof value;
  if (type === "number" && actual !== "number") warn(id, `${field} should be number, got ${actual}`);
  if (type === "string" && actual !== "string") warn(id, `${field} should be string, got ${actual}`);
  if (type === "boolean" && actual !== "boolean") warn(id, `${field} should be boolean, got ${actual}`);
  if (type === "array" && actual !== "array") warn(id, `${field} should be array, got ${actual}`);
}

const props = schema.properties;
const labelProps = props.labels.properties;
const qualityReq = props.quality.required;
const rightsReq = props.rights.required;

let checked = 0;

for (const p of catalog.products) {
  const id = p.product_id ?? "(missing product_id)";
  checked += 1;

  for (const field of schema.required) {
    if (p[field] === undefined || p[field] === null || p[field] === "") {
      warn(id, `missing required field "${field}"`);
    }
  }

  if (p.product_id && !/^SIM-[0-9]{3}$/.test(p.product_id)) {
    warn(id, `product_id "${p.product_id}" fails pattern ^SIM-[0-9]{3}$`);
  }
  if (p.retailer !== undefined && p.retailer !== "Simons") {
    warn(id, `retailer must be "Simons", got "${p.retailer}"`);
  }
  if (p.currency !== undefined && p.currency !== "CAD") {
    warn(id, `currency must be "CAD", got "${p.currency}"`);
  }
  checkEnum(id, "sale_status", p.sale_status, props.sale_status.enum);
  checkEnum(id, "availability_status", p.availability_status, props.availability_status.enum);
  checkEnum(id, "canonical_category", p.canonical_category, props.canonical_category.enum);
  checkEnum(id, "required_slot", p.required_slot, props.required_slot.enum);
  checkType(id, "current_price", p.current_price, "number");
  if (typeof p.current_price === "number" && p.current_price < 0) {
    warn(id, "current_price is negative");
  }

  const l = p.labels;
  if (!l) {
    warn(id, "missing labels object");
  } else {
    for (const field of props.labels.required) {
      if (l[field] === undefined) warn(id, `labels.${field} missing`);
    }
    checkType(id, "labels.formality", l.formality, "number");
    checkType(id, "labels.warmth", l.warmth, "number");
    if (typeof l.formality === "number" && (l.formality < 1 || l.formality > 5)) {
      warn(id, `labels.formality ${l.formality} out of range 1-5`);
    }
    if (typeof l.warmth === "number" && (l.warmth < 1 || l.warmth > 5)) {
      warn(id, `labels.warmth ${l.warmth} out of range 1-5`);
    }
    for (const tag of l.occasion_tags ?? []) {
      checkEnum(id, "labels.occasion_tags[]", tag, labelProps.occasion_tags.items.enum);
    }
    for (const role of l.look_roles ?? []) {
      checkEnum(id, "labels.look_roles[]", role, labelProps.look_roles.items.enum);
    }
    checkEnum(id, "labels.budget_role", l.budget_role, labelProps.budget_role.enum);
  }

  if (p.quality) {
    for (const field of qualityReq) {
      if (p.quality[field] === undefined) warn(id, `quality.${field} missing`);
    }
  }

  if (!p.rights) {
    warn(id, "missing rights object");
  } else {
    for (const field of rightsReq) {
      if (p.rights[field] === undefined) warn(id, `rights.${field} missing`);
    }
    // Business rule from the labeling rules doc, not just the schema: until
    // affiliate/content permission exists, Simons images/descriptions must
    // never be marked safe to show.
    if (p.rights.public_display_allowed === true) {
      warn(id, "rights.public_display_allowed=true — not permitted pre-affiliate-approval");
    }
    if (p.rights.image_use_authorized === true) {
      warn(id, "rights.image_use_authorized=true — not permitted pre-affiliate-approval");
    }
    if (p.rights.link_out_only !== true) {
      warn(id, "rights.link_out_only must be true for the pilot");
    }
  }
}

const bySlot = {};
for (const p of catalog.products) {
  bySlot[p.required_slot] = (bySlot[p.required_slot] ?? 0) + 1;
}

console.log(`Checked ${checked} products (file reports count=${catalog.count}).`);
console.log("By required_slot:", bySlot);

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exitCode = 1;
} else {
  console.log("\nAll products valid against product.schema.json.");
}
