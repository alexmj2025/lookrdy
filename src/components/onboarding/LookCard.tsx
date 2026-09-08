"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/format";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { ArrowRight, Heart, Star } from "./icons";
import type { Look } from "@/lib/types";

export function LookCard({
  look,
  index,
  budgetMax,
  currency,
  country,
}: {
  look: Look;
  index: number;
  budgetMax: number;
  currency: string;
  country: string;
}) {
  const [saved, setSaved] = useState(false);
  const under = budgetMax - look.total;

  return (
    <article className="onb-look" style={{ "--d": `${index * 110}ms` } as React.CSSProperties}>
      <div className="onb-look__media">
        {look.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={look.imageUrl} alt={`${look.name} shown on your photo`} />
        ) : (
          <span className="onb-card__ph" aria-hidden="true">
            Visualization unavailable
          </span>
        )}

        {look.recommended && (
          <span className="onb-badge">
            <Star /> Recommended
          </span>
        )}

        <button
          type="button"
          className="onb-save"
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save this look"}
          onClick={() => setSaved((v) => !v)}
        >
          <Heart />
        </button>

        <div className="onb-look__overlay">
          <p className="onb-look__index">Look {index + 1}</p>
          <h2 className="onb-look__title">{look.name}</h2>
          <p className="onb-look__rationale">{look.rationale}</p>
        </div>
      </div>

      <div className="onb-look__foot">
        <div className="onb-tags">
          {look.descriptors.slice(0, 1).map((d) => (
            <span className="onb-tag" key={d}>
              {d}
            </span>
          ))}
          {under >= 0 && <span className="onb-tag onb-tag--good">Within budget</span>}
          <span className="onb-tag">Ships to {country}</span>
          {look.layers && look.layers.length > 0 && (
            <span className="onb-tag">+ optional layer</span>
          )}
        </div>

        <div className="onb-look__cta">
          <span className="onb-price">
            {money(look.total, currency)}
            {under >= 0 && (
              <small>{money(under, currency)} under budget</small>
            )}
          </span>
          <Link
            href={`/looks/${look.id}`}
            className="onb-btn onb-btn--primary"
            style={{ minHeight: "2.5rem", padding: "0 1.125rem", fontSize: "0.875rem" }}
            onClick={() =>
              trackOnboarding("look_selected", { lookId: look.id, index })
            }
          >
            View this look <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
