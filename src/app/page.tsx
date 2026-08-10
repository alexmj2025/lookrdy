"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Wordmark } from "@/components/Wordmark";
import { track } from "@/lib/analytics/client";

export default function LandingPage() {
  useEffect(() => {
    track("landing");
  }, []);

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-10">
        <Wordmark />
        <span className="label">AI personal styling</span>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-20">
        <h1 className="display max-w-4xl text-[2.75rem] md:text-7xl">
          See yourself in the outfit before you buy it.
        </h1>

        <p className="lede mt-8 text-lg md:mt-10">
          Tell us the occasion, your budget, and how you want to look. Lookrdy
          builds three complete outfits from real products you can actually
          buy — then shows you wearing each one.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center md:mt-12">
          <Link
            href="/photo"
            className="btn w-full sm:w-auto"
            onClick={() => track("started")}
          >
            Get started
          </Link>
          <span className="label">Takes about 90 seconds · No account</span>
        </div>
      </section>

      {/* Full-bleed editorial band */}
      <section className="border-y hairline bg-[var(--color-wash)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:gap-12 md:px-10 md:py-20">
          <div>
            <p className="label-ink">01 — Your photo</p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
              Upload or take a full-body photo. It stays in your browser, is
              used once to build your visualization, and is never stored.
            </p>
          </div>
          <div>
            <p className="label-ink">02 — Real products first</p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
              We search the catalog for pieces that fit your occasion, budget,
              and location — then compose the outfits from what actually exists.
            </p>
          </div>
          <div>
            <p className="label-ink">03 — Tap to shop</p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
              Every garment in the image is tappable. See the brand, the price,
              and go straight to the retailer.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-12 md:px-10">
        <p className="text-sm text-[var(--color-muted)]">
          Images are AI visualizations. Fit is not guaranteed; price and stock
          are confirmed on the retailer&rsquo;s site.
        </p>
      </footer>
    </main>
  );
}
