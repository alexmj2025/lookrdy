"use client";

import { useState } from "react";
import { Check } from "./icons";

/**
 * One selectable image card, shared by the occasion and style grids — they
 * differ only in whether selection is single or multiple, which the parent
 * owns. Building two near-identical card components would just be two places
 * to fix the same hover or focus bug.
 *
 * Falls back to a labelled placeholder when the image isn't in /public yet,
 * matching the landing page's Photo component so a missing asset never shows
 * a broken-image icon.
 */
export function SelectCard({
  label,
  image,
  selected,
  onToggle,
}: {
  label: string;
  image: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      className="onb-card"
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="onb-card__media">
        {!failed && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
        {failed && (
          <span className="onb-card__ph" aria-hidden="true">
            {image.replace("/landing/", "")}
          </span>
        )}
        <span className="onb-card__check">
          <Check size={13} />
        </span>
      </span>
      <span className="onb-card__label">{label}</span>
    </button>
  );
}
