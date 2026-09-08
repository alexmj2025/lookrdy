import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/Wordmark";
import { composeSimonsOutfits, BASE_MIN, BASE_MAX } from "@/lib/simons/compose";
import type { SimonsOutfitItem } from "@/lib/simons/compose";
import { money } from "@/lib/format";
import type { LookRole, Occasion } from "@/lib/simons/types";

export const metadata: Metadata = {
  title: "Simons MVP catalog — Lookrdy",
  description:
    "Base outfits (top + pants + shoes, CAD 200-450) composed from the Simons pilot catalog.",
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
        <p className="label">Simons MVP catalog · pilot</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">
          Base outfits, {money(BASE_MIN, "CAD")}–{money(BASE_MAX, "CAD")}
        </h1>
        <p className="lede mt-6">
          Every look is exactly one top, one pair of pants, and one pair of
          shoes, priced within budget. Optional layers are shown separately
          and never counted toward that total.
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
            Lookrdy is not officially affiliated with Simons. Products link
            out to simons.ca; price, size, and availability must be confirmed
            there before you buy — this pilot catalog is not a live stock
            feed.
          </p>
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

              <div className="mt-5 grid gap-3">
                <ItemRow slot="Top" item={outfit.top} />
                <ItemRow slot="Pants" item={outfit.bottom} />
                <ItemRow slot="Shoes" item={outfit.shoes} />
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
  const { product, needsRecheck } = item;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <p className="label">{slot}</p>
        <p className="mt-1 text-[0.9375rem]">
          {product.brand} — {product.title}
        </p>
        {needsRecheck && (
          <p className="mt-1 text-xs text-[var(--color-meta)]">
            Price and availability need a fresh check before you buy.
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[0.9375rem]">
          {money(product.current_price, product.currency)}
        </span>
        <a
          href={product.url}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="btn-text"
        >
          Shop at Simons.ca
        </a>
      </div>
    </div>
  );
}
