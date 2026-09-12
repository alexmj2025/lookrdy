"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "../../onboarding.css";

import { Logo } from "@/components/Logo";
import { ProductMatchRow } from "@/components/onboarding/ProductMatchRow";
import { ArrowLeft, Star } from "@/components/onboarding/icons";
import { getResult } from "@/lib/flowStore";
import { money } from "@/lib/format";
import type { GenerationResult, Look } from "@/lib/types";

export default function LookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [look, setLook] = useState<Look | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getResult().then((r) => {
      if (cancelled) return;
      if (!r) {
        router.replace("/create");
        return;
      }
      const found = r.looks.find((l) => l.id === id);
      if (!found) {
        router.replace("/looks");
        return;
      }
      setResult(r);
      setLook(found);
    });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (!result || !look) return <div className="onb" style={{ minHeight: "100dvh" }} />;

  const budget = result.request.budget;
  const currency = result.request.currency;
  const diff = budget - look.total;

  return (
    <div className="onb">
      <div className="onb-shell">
        <header className="onb-topbar">
          <Link href="/" className="onb-topbar__mark" aria-label="Lookrdy home">
            <Logo height={22} priority />
          </Link>
          <span />
          <div className="onb-topbar__end">
            <Link href="/looks" className="onb-btn onb-btn--quiet">
              <ArrowLeft size={15} /> All looks
            </Link>
          </div>
        </header>

        <div className="onb-panel">
          <div className="onb-detail">
            <div className="onb-detail__media">
              {look.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={look.imageUrl} alt={`${look.name} shown on your photo`} />
              ) : (
                <div
                  className="onb-card__ph"
                  style={{ position: "static", aspectRatio: "3 / 4" }}
                >
                  Visualization unavailable
                </div>
              )}
            </div>

            <div>
              {look.recommended && (
                <span
                  className="onb-tag onb-tag--good"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <Star size={12} /> Recommended
                </span>
              )}

              <h1 className="onb-h1">{look.name}</h1>
              <p className="onb-lede">{look.rationale}</p>

              <div className="onb-tags" style={{ marginTop: "1rem" }}>
                {look.descriptors.map((d) => (
                  <span className="onb-tag" key={d}>
                    {d}
                  </span>
                ))}
              </div>

              <div className="onb-summary">
                <div className="onb-summary__row">
                  <span className="onb-label" style={{ margin: 0 }}>
                    Estimated total
                  </span>
                  <span className="onb-price" style={{ fontSize: "1.5rem" }}>
                    {money(look.total, currency)}
                  </span>
                </div>
                <p className="onb-help" style={{ marginTop: "0.375rem" }}>
                  {diff >= 0
                    ? `${money(diff, currency)} under your ${money(budget, currency)} budget`
                    : `${money(Math.abs(diff), currency)} over your ${money(budget, currency)} budget`}
                </p>
              </div>

              <h2
                className="onb-aside__title"
                style={{ marginTop: "1.75rem", marginBottom: "0.25rem" }}
              >
                Shop this look
              </h2>
              <p className="onb-help" style={{ margin: 0 }}>
                Similar options that reproduce this look direction — not the
                exact garments shown in the visualization. Confirm price,
                colour, size and availability on the retailer&rsquo;s site.
              </p>

              <div className="onb-rows">
                {look.items.map((item) => (
                  <ProductMatchRow key={item.id} product={item} />
                ))}
              </div>

              {look.layers && look.layers.length > 0 && (
                <>
                  <h2
                    className="onb-aside__title"
                    style={{ marginTop: "1.75rem", marginBottom: "0.25rem" }}
                  >
                    Optional layer
                  </h2>
                  <p className="onb-help" style={{ margin: 0 }}>
                    Priced separately — not included in the total above.
                  </p>
                  <div className="onb-rows">
                    {look.layers.map((item) => (
                      <ProductMatchRow key={item.id} product={item} />
                    ))}
                  </div>
                </>
              )}

              <p className="onb-help" style={{ marginTop: "1.5rem" }}>
                The image is an AI visualization of a style direction, not a
                photograph of these products. Lookrdy is not officially
                affiliated with Simons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
