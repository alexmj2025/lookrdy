import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/Wordmark";
import { composeSimonsOutfits, BASE_MIN, BASE_MAX } from "@/lib/simons/compose";
import type { SimonsOutfitItem } from "@/lib/simons/compose";
import { catalogHealth } from "@/lib/simons/catalog";
import { money } from "@/lib/format";
import type { LookRole, Occasion } from "@/lib/simons/types";

export const metadata: Metadata = {
  title: "Simons catalog — Lookrdy",
  description:
    "Base outfits (top + bottom + footwear, CAD 200-450) composed from the Simons pilot catalog.",
};

const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "company_dinner", label: "Company dinner" },
  { id: "date_upscale_dinner", label: "Date / upscale dinner" },
  { id: "everyday_upgrade", label: "Everyday upgrade" },
];

const ROLE_COPY: Record<LookRole, string> = {
  Safe: "Safe — neutral, nothing to second-guess.",
  Polished: "Polished — a little more colour or texture.",
  Bold: "Bold — a statement piece, kept in check.",
};

/**
 * Deliberately words rather than a percentage. A score can read 100% while
 * most of the category's attributes are unknown, so a number would imply a
 * precision the catalog doesn't have; these bands come from the matching
 * contract's own score_interpretation and are already capped by coverage.
 */
const BAND_COPY: Record<string, string> = {
  strong: "Strong match to this direction",
  usable: "Good match to this direction",
  fallback: "Loose match — limited attribute data",
  reject: "Weak match to this direction",
};

function isValidOccasion(v: string | undefined): v is Occasion {
  return OCCASIONS.some((o) => o.id === v);
}

export default async function SimonsMvpPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const params = await searchParams;
  const occasion: Occasion = isValidOccasion(params.occasion)
    ? params.occasion
    : "company_dinner";

  const outfits = composeSimonsOutfits(occasion);
  const health = catalogHealth();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
        <p className="label">Simons pilot catalog · {health.catalogVersion}</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">
          Base outfits, {money(BASE_MIN, "CAD")}–{money(BASE_MAX, "CAD")}
        </h1>
        <p className="lede mt-6">
          Every look is exactly one top, one bottom, and one pair of shoes,
          priced within budget. Optional layers are shown separately and never
          counted toward that total.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {OCCASIONS.map((o) => (
            <Link
              key={o.id}
              href={`/simons-mvp?occasion=${o.id}`}
              className="chip"
              aria-pressed={o.id === occasion}
            >
              {o.label}
            </Link>
          ))}
        </div>

        <div className="mt-4 border-y hairline py-4">
          <p className="text-sm leading-relaxed text-[var(--color-meta)]">
            These are <strong>similar options</strong> that reproduce the look
            direction — not the exact garment from any visualization. Lookrdy
            is not officially affiliated with Simons. Confirm price, colour,
            size and availability on simons.ca before you buy; this pilot
            catalog is not a live stock feed.
          </p>
          {health.overdue > 0 && (
            <p className="mt-2 text-xs text-[var(--color-meta)]">
              {health.overdue} of {health.total} items are past their review
              date
              {health.blockingOverdue
                ? " and are being withheld (SIMONS_BLOCK_OVERDUE=1)."
                : " and are shown with a revalidation warning."}
            </p>
          )}
        </div>

        {outfits.length === 0 && (
          <p className="mt-10 text-[var(--color-meta)]">
            We couldn&rsquo;t compose a complete {money(BASE_MIN, "CAD")}–
            {money(BASE_MAX, "CAD")} outfit for this occasion from the current
            pilot catalog.
          </p>
        )}

        <div className="mt-10 grid gap-8">
          {outfits.map((outfit) => (
            <article key={outfit.role} className="border hairline p-5 md:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="label-ink">{ROLE_COPY[outfit.role]}</p>
                <p className="label-ink">
                  Base total {money(outfit.baseTotal, "CAD")}
                </p>
              </div>

              {outfit.outfitBand !== "unscored" && (
                <p className="mt-1 text-xs text-[var(--color-meta)]">
                  {BAND_COPY[outfit.outfitBand]}
                </p>
              )}

              <div className="mt-5 grid gap-3">
                <ItemRow slot="Top" item={outfit.top} />
                <ItemRow slot="Bottom" item={outfit.bottom} />
                <ItemRow slot="Shoes" item={outfit.footwear} />
              </div>

              {outfit.usedSaleItem && (
                <p className="mt-3 text-xs text-[var(--color-meta)]">
                  Includes a sale-priced item — used only because a
                  regular-price combination wasn&rsquo;t available in this
                  band.
                </p>
              )}

              {outfit.layers.length > 0 && (
                <div className="mt-6 border-t hairline pt-5">
                  <p className="label">Optional layer · priced separately</p>
                  <div className="mt-3 grid gap-3">
                    {outfit.layers.map((layer) => (
                      <ItemRow
                        key={layer.product.product_id}
                        slot="Layer"
                        item={layer}
                      />
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

function ItemRow({ slot, item }: { slot: string; item: SimonsOutfitItem }) {
  const { product, needsRecheck, needsVariant } = item;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <p className="label">{slot}</p>
        <p className="mt-1 text-[0.9375rem]">
          {product.identity.brand} — {product.identity.title}
        </p>
        {needsVariant && (
          <p className="mt-1 text-xs text-[var(--color-meta)]">
            Choose colour and size on the retailer&rsquo;s page.
          </p>
        )}
        {needsRecheck && (
          <p className="mt-1 text-xs text-[var(--color-meta)]">
            Price and availability need a fresh check before you buy.
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[0.9375rem]">
          {money(product.commerce.current_price, product.commerce.currency)}
        </span>
        <a
          href={product.commerce.product_url}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="btn-text"
        >
          Shop this type of item
        </a>
      </div>
    </div>
  );
}
