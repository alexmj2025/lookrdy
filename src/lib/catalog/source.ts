import "server-only";
import catalogJson from "@/data/catalog.json";
import { getSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

// ============================================================================
// PRODUCT DATA LAYER — integration boundary #1: live affiliate feeds.
//
// Today: reads the `products` table in Supabase, falling back to the bundled
// placeholder catalog (src/data/catalog.json) when Supabase isn't configured.
//
// To go live, replace the body of `fetchAll()` with a loader for a real
// affiliate feed (Rakuten / Awin / Skimlinks): fetch the feed, map each entry
// onto the `Product` shape, and refresh `price` / `lastChecked` on a schedule.
// Nothing downstream — retrieval, composition, visualization, the UI — needs
// to change, because everything consumes `Product`.
// ============================================================================

const localProducts = catalogJson.products as Product[];

let memo: { at: number; products: Product[] } | null = null;
const TTL_MS = 60_000;

/**
 * Which backend actually served the catalog on the last read.
 *
 * The fallback to local JSON is deliberately silent so a Supabase outage can
 * never break the user flow — but that means a misconfigured deployment looks
 * identical to a working one. This flag is what /api/health reports, so the
 * difference is observable.
 */
export type CatalogSource = "supabase" | "local-json";

let lastSource: CatalogSource = "local-json";
let lastError: string | null = null;

export function getCatalogStatus(): {
  source: CatalogSource;
  error: string | null;
} {
  return { source: lastSource, error: lastError };
}

async function fetchAll(): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) {
    lastSource = "local-json";
    lastError = "Supabase credentials not configured";
    return localProducts;
  }

  const { data, error } = await supabase.from("products").select("*");
  if (error || !data || data.length === 0) {
    // Table missing, empty, or unreachable — fall back rather than break the
    // flow. Run `npm run seed` to populate it.
    lastSource = "local-json";
    lastError = error
      ? error.message
      : "products table is empty — run `npm run seed`";
    if (error) {
      console.warn(
        `[catalog] Supabase read failed (${error.message}); using local catalog.`,
      );
    }
    return localProducts;
  }

  lastSource = "supabase";
  lastError = null;
  return data.map(rowToProduct);
}

/** Supabase stores snake_case columns; the app speaks camelCase. */
function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    retailer: String(row.retailer),
    name: String(row.name),
    category: row.category as Product["category"],
    color: String(row.color),
    styleTags: (row.style_tags as string[]) ?? [],
    formality: Number(row.formality),
    price: Number(row.price),
    currency: String(row.currency),
    imageUrl: String(row.image_url),
    productUrl: String(row.product_url),
    countries: (row.countries as string[]) ?? [],
    sizes: (row.sizes as string[]) ?? [],
    lastChecked: String(row.last_checked ?? ""),
    tier: row.tier as Product["tier"],
  };
}

export async function getAllProducts(): Promise<Product[]> {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.products;
  const products = await fetchAll();
  memo = { at: Date.now(), products };
  return products;
}

export async function getProductsByIds(
  ids: string[],
): Promise<Map<string, Product>> {
  const all = await getAllProducts();
  const wanted = new Set(ids);
  return new Map(all.filter((p) => wanted.has(p.id)).map((p) => [p.id, p]));
}
