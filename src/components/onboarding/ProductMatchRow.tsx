"use client";

import { money } from "@/lib/format";
import { wrapOutboundUrl } from "@/lib/affiliate";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import type { Product } from "@/lib/types";

/**
 * One product inside a look.
 *
 * Stock and distance come from the catalog record. Where the catalog doesn't
 * know, the row says nothing rather than inventing "In stock" — an
 * availability claim we can't back is exactly what the AI Disclosure tells
 * users not to expect from us.
 */
export function ProductMatchRow({
  product,
  onChange,
}: {
  product: Product;
  onChange?: (product: Product) => void;
}) {
  return (
    <div className="onb-row">
      <span className="onb-row__media">
        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={product.imageUrl} alt="" loading="lazy" />
        ) : null}
      </span>

      <span>
        <span className="onb-row__brand">{product.retailer}</span>
        <span className="onb-row__name">{product.name}</span>
        <span className="onb-row__meta">
          {product.color}
          {product.sizes.length > 0 && ` · ${product.sizes.length} sizes`}
        </span>
        {product.needsRecheck && (
          <span className="onb-row__meta">
            Price and availability need a fresh check before you buy.
          </span>
        )}
      </span>

      <span className="onb-row__end">
        <span className="onb-row__price">
          {money(product.price, product.currency)}
        </span>
        <span className="onb-row__actions">
          {onChange && (
            <button
              type="button"
              className="onb-mini"
              onClick={() => onChange(product)}
            >
              Change
            </button>
          )}
          <a
            className="onb-mini"
            href={wrapOutboundUrl(product)}
            target="_blank"
            // affiliateApproved === false means no affiliate relationship
            // exists with this retailer yet — nofollow so the link doesn't
            // imply an endorsement or earn attribution we haven't agreed to.
            rel={
              product.affiliateApproved === false
                ? "nofollow noopener noreferrer"
                : "noopener noreferrer"
            }
            onClick={() =>
              trackOnboarding("product_clicked", {
                productId: product.id,
                retailer: product.retailer,
              })
            }
          >
            Shop this item
          </a>
        </span>
      </span>
    </div>
  );
}
