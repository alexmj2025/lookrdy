"use client";

import { Pin } from "./icons";

/**
 * Location step, simplified to a fixed-Canada confirmation.
 *
 * This used to be a 4-country picker with a "stores we search" strip naming
 * seven retailers. Once the engine runs on the Simons pilot catalog — CAD
 * only, ships within Canada only — that strip would be naming stores we no
 * longer search, which is exactly the kind of false claim the Affiliate
 * Disclosure commits not to make. The city/postal field stays: it isn't used
 * by the composer yet, but it's harmless to collect and is the natural seed
 * for a future proximity feature.
 */
export function CountrySelector({
  cityOrPostalCode,
  onCity,
}: {
  cityOrPostalCode: string;
  onCity: (value: string) => void;
}) {
  return (
    <div>
      <div className="onb-note" style={{ marginTop: 0 }}>
        <Pin />
        <span>
          <strong>Canada · Simons.ca pilot</strong>
          <span>
            We&rsquo;re currently sourcing looks from Simons.ca. More
            retailers and regions are on the way.
          </span>
        </span>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <label className="onb-label" htmlFor="onb-city">
          City or postal code{" "}
          <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
        </label>
        <input
          id="onb-city"
          className="onb-field"
          value={cityOrPostalCode}
          placeholder="e.g. Vancouver or V6B 1A1"
          onChange={(e) => onCity(e.target.value)}
        />
        <p className="onb-help">
          Helps us show what&rsquo;s available near you as we add more
          retailers.
        </p>
      </div>
    </div>
  );
}
