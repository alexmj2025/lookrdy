"use client";

import { Pin } from "./icons";
import {
  COUNTRIES,
  RETAILERS_BY_COUNTRY,
  type CountryCode,
} from "@/lib/onboarding/types";

export function CountrySelector({
  country,
  cityOrPostalCode,
  onCountry,
  onCity,
}: {
  country: CountryCode;
  cityOrPostalCode: string;
  onCountry: (code: CountryCode) => void;
  onCity: (value: string) => void;
}) {
  const active = COUNTRIES.find((c) => c.code === country);

  return (
    <div>
      <label className="onb-label" htmlFor="onb-country">
        Country
      </label>
      <select
        id="onb-country"
        className="onb-field"
        value={country}
        onChange={(e) => onCountry(e.target.value as CountryCode)}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag}  {c.name}
          </option>
        ))}
      </select>

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
          Helps us show what&rsquo;s actually available near you.
        </p>
      </div>

      <RetailerStrip country={country} countryName={active?.name ?? "your region"} />
    </div>
  );
}

/**
 * Examples of where product matches are sourced. The copy is careful: these
 * are sources we search, NOT partners — the Affiliate Disclosure commits to
 * not implying a relationship that doesn't exist.
 */
export function RetailerStrip({
  country,
  countryName,
}: {
  country: CountryCode;
  countryName: string;
}) {
  return (
    <div style={{ marginTop: "1.75rem" }}>
      <p className="onb-label" style={{ marginBottom: "0.25rem" }}>
        Stores we search in {countryName}
      </p>
      <div className="onb-retailers">
        {RETAILERS_BY_COUNTRY[country].map((r) => (
          <span className="onb-retailer" key={r}>
            {r}
          </span>
        ))}
      </div>
      <p className="onb-help">
        <Pin size={13} /> Examples only — Lookrdy isn&rsquo;t affiliated with
        these retailers, and availability varies by location.
      </p>
    </div>
  );
}
