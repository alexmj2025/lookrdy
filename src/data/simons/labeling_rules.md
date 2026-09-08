# Lookrdy × Simons MVP catalog rules v1

## Fixed business decisions

- Audience: men aged 25–40 living in Canada.
- Occasions: company dinner/work event; date/upscale dinner; everyday style upgrade.
- Base outfit: top + pants + shoes, total CAD 200–450 inclusive.
- Optional layers: blazer, jacket, coat, or knit layer; excluded from the CAD 450 base cap.
- Season: fall through early winter in Canada.
- Looks: Safe (neutral), Polished (broader colour/texture), Bold (statement colour, pattern, or silhouette).
- Company dinner default: business casual; collared shirt and pants required, blazer recommended.
- Brands: unrestricted if the item supports the price and use-case rules.
- Sales: regular-price items are primary; sale items are backup only.

## Data contract

1. Source facts (title, brand, price, URL, explicit colour and availability wording) must remain separate from inferred labels.
2. A product may be shown publicly only after click-time price/stock revalidation.
3. Before affiliate/content permission, do not store or display Simons product images, copied descriptions, or retailer marks. Use link-out-only presentation and do not imply partnership.
4. `indexed_current` means the official page or official indexed category result was current on `source_checked_at`; it is not a live stock guarantee.
5. If a page says unavailable, out of stock, or discontinued, set `active_for_pilot=false` immediately.
6. If colour or fit is not explicitly observed for the selected variant, retain `needs_review=true`.

## Outfit validator

- Exactly one active item from each base slot: top, bottom, shoes.
- Base total formula: top.current_price + bottom.current_price + shoes.current_price.
- Accept only when 200 <= base total <= 450 CAD.
- Optional-layer price is reported separately and never added to the base validator.
- Company dinner combinations require a collared top and pants with formality >= 3; recommend a blazer when available.
- Safe: all three base items neutral and no statement pattern/silhouette.
- Polished: at most one expanded colour, texture, or relaxed-tailoring element.
- Bold: at least one expanded colour, statement pattern, or fashion-forward silhouette; keep the remaining items controlled.

## Claude Code handoff

Use `lookrdy_product.schema.json` for runtime validation and `lookrdy_taxonomy.json` for enums. The spreadsheet is the review surface; `simons_products.json` is the application seed. Keep human edits in source/label/rights groups instead of flattening them into an opaque prompt.
