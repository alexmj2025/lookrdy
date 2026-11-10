import type { Product } from "./types";

// ============================================================================
// Integration boundary: affiliate link wrapping.
//
// `wrapOutboundUrl` is the single choke point for every outbound retailer
// link in the app. Today it returns the plain product URL. When you join an
// affiliate programme (Rakuten / Awin / Skimlinks), wrap here — or populate an
// `affiliateUrl` field on Product in the feed and prefer it.
//
// RULE: organic ranking must stay independent of affiliate consideration.
// Ranking happens in src/lib/catalog/retrieve.ts and must never read
// commission data. Affiliate logic affects the href and nothing else.
// ============================================================================

export function wrapOutboundUrl(product: Product): string {
  return product.productUrl;
}
