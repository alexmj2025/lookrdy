"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/Wordmark";
import { AiLabel, Disclaimer } from "@/components/Disclaimer";
import { HotspotImage } from "@/components/HotspotImage";
import { track } from "@/lib/analytics/client";
import { wrapOutboundUrl } from "@/lib/affiliate";
import { getResult } from "@/lib/flowStore";
import { money } from "@/lib/format";
import type { GenerationResult, Look } from "@/lib/types";

export default function LookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [look, setLook] = useState<Look | null>(null);

  useEffect(() => {
    const r = getResult();
    if (!r) {
      router.replace("/request");
      return;
    }
    const found = r.looks.find((l) => l.id === id);
    if (!found) {
      router.replace("/results");
      return;
    }
    setResult(r);
    setLook(found);
  }, [id, router]);

  if (!result || !look) return null;

  const { currency, budget } = result.request;
  const overBudget = look.total > budget;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-6 md:px-10 md:pt-10">
        <Link href="/results" className="label hover:text-[var(--color-ink)]">
          ← All three looks
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
          {/* Image + hotspots */}
          <div>
            {look.recommended && <p className="label-ink mb-3">Recommended</p>}
            <h1 className="display text-4xl md:text-5xl">{look.name}</h1>
            <p className="label mt-3">{look.descriptors.join(" · ")}</p>
            <p className="prose-measure mt-5 text-lg leading-relaxed">
              {look.rationale}
            </p>

            <div className="mt-8">
              <HotspotImage look={look} currency={currency} />
            </div>
            <AiLabel className="mt-4" />
          </div>

          {/* Stacked list — the fallback for anyone who never taps a hotspot */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border-y hairline py-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="label-ink">Running total</span>
                <span className="text-lg">
                  <span className="font-medium">
                    {money(look.total, currency)}
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {" "}
                    of {money(budget, currency)}
                  </span>
                </span>
              </div>
              <div className="mt-3 h-px w-full bg-[var(--color-line)]">
                <div
                  className="h-px bg-[var(--color-ink)]"
                  style={{
                    width: `${Math.min(100, (look.total / budget) * 100)}%`,
                  }}
                />
              </div>
              {overBudget && (
                <p className="mt-2 text-sm">This look is over your budget.</p>
              )}
            </div>

            <p className="label mt-8">The pieces</p>
            <ul className="mt-4 divide-y divide-[var(--color-line)] border-y hairline">
              {look.items.map((product) => (
                <li key={product.id} className="flex gap-4 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="h-24 w-20 shrink-0 border hairline object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="label">{product.category}</p>
                    <p className="mt-1 text-[0.9375rem] leading-snug">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {product.retailer} · {product.color}
                    </p>
                    <p className="mt-1.5 text-[0.9375rem] font-medium">
                      {money(product.price, currency)}
                    </p>
                    <p className="label mt-1.5">
                      Sizes {product.sizes.join(" / ")}
                    </p>
                    <a
                      href={wrapOutboundUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        track("retailer_clicked", {
                          lookId: look.id,
                          productId: product.id,
                          retailer: product.retailer,
                          source: "list",
                        })
                      }
                      className="btn-text mt-2"
                    >
                      Shop at {product.retailer}
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Disclaimer />
            </div>

            <Link href="/results" className="btn-outline mt-8 w-full">
              Back to all looks
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}
