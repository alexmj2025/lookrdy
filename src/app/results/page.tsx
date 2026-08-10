"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/Wordmark";
import { AiLabel, Disclaimer } from "@/components/Disclaimer";
import { track } from "@/lib/analytics/client";
import { getResult } from "@/lib/flowStore";
import { money } from "@/lib/format";
import type { GenerationResult } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResultState] = useState<GenerationResult | null>(null);

  useEffect(() => {
    const r = getResult();
    if (!r) {
      router.replace("/request");
      return;
    }
    setResultState(r);
  }, [router]);

  if (!result) return null;

  const { request, looks, generationsUsed, generationsAllowed } = result;
  const remaining = Math.max(0, generationsAllowed - generationsUsed);
  const unknownCountry = result.constraints.country === null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
        <p className="label">
          {request.occasion} · {request.location} · Budget{" "}
          {money(request.budget, request.currency)}
        </p>
        <h1 className="display mt-3 text-4xl md:text-5xl">
          Three ways to wear it.
        </h1>
        <AiLabel className="mt-5" />

        {unknownCountry && (
          <p className="prose-measure mt-5 border-l-2 border-[var(--color-ink)] pl-4 text-[0.9375rem] leading-relaxed">
            We couldn&rsquo;t match &ldquo;{request.location}&rdquo; to a
            country we have shipping data for, so these looks include every
            retailer we carry. Check delivery to your address on the
            retailer&rsquo;s site before ordering.
          </p>
        )}

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-7">
          {looks.map((look) => (
            <article key={look.id} className="fade-up">
              <Link
                href={`/look/${look.id}`}
                className="group block"
                onClick={() =>
                  track("look_selected", { lookId: look.id, name: look.name })
                }
              >
                <div className="relative border hairline bg-[var(--color-wash)]">
                  {look.recommended && (
                    <span className="label-ink absolute left-0 top-0 z-10 bg-[var(--color-ink)] px-3 py-2 text-white">
                      Recommended
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={look.imageUrl}
                    alt={`Visualization of the ${look.name} outfit`}
                    className="aspect-[2/3] w-full object-cover"
                  />
                </div>

                <h2 className="display mt-5 text-2xl group-hover:underline group-hover:underline-offset-4">
                  {look.name}
                </h2>
              </Link>

              <p className="label mt-2.5">{look.descriptors.join(" · ")}</p>

              <p className="mt-4 text-[0.9375rem]">
                <span className="font-medium">
                  {money(look.total, request.currency)}
                </span>{" "}
                <span className="text-[var(--color-muted)]">
                  of {money(request.budget, request.currency)} · {look.items.length}{" "}
                  pieces
                </span>
              </p>

              <p className="mt-3 text-[0.9375rem] leading-relaxed">
                {look.rationale}
              </p>

              <Link
                href={`/look/${look.id}`}
                className="btn-text mt-5"
                onClick={() => track("look_selected", { lookId: look.id })}
              >
                See the pieces
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 border-t hairline pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.9375rem] text-[var(--color-muted)]">
              {remaining > 0
                ? `${remaining} of ${generationsAllowed} free looks left in this session.`
                : `You've used all ${generationsAllowed} free looks in this session.`}
            </p>
            {remaining > 0 && (
              <Link
                href="/request"
                className="btn-outline"
                onClick={() => track("repeat_generation")}
              >
                Try a different brief
              </Link>
            )}
          </div>
          <div className="mt-8">
            <Disclaimer />
          </div>
        </div>
      </main>
    </>
  );
}
