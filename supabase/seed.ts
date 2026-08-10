/**
 * Seeds the Supabase `products` table from src/data/catalog.json.
 *
 * Usage:
 *   1. Run supabase/schema.sql in the Supabase SQL editor.
 *   2. Put NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm run seed
 *
 * Idempotent — upserts on primary key, so re-running after editing the catalog
 * updates existing rows rather than duplicating them.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env.local — rely on the ambient environment.
  }
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Add them to .env.local (see .env.local.example), then re-run `npm run seed`.",
    );
    process.exit(1);
  }

  const catalogPath = resolve(process.cwd(), "src/data/catalog.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as {
    products: Array<Record<string, unknown>>;
  };

  const rows = catalog.products.map((p) => ({
    id: p.id,
    retailer: p.retailer,
    name: p.name,
    category: p.category,
    color: p.color,
    style_tags: p.styleTags,
    formality: p.formality,
    price: p.price,
    currency: p.currency,
    image_url: p.imageUrl,
    product_url: p.productUrl,
    countries: p.countries,
    sizes: p.sizes,
    last_checked: p.lastChecked,
    tier: p.tier,
  }));

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  console.log(`Seeding ${rows.length} products…`);

  // Chunked so a large catalog doesn't hit request size limits.
  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("products")
      .upsert(slice, { onConflict: "id" });
    if (error) {
      console.error(`Failed at row ${i}: ${error.message}`);
      process.exit(1);
    }
    console.log(`  …${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  console.log(`Done. products table now holds ${count ?? "?"} rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
