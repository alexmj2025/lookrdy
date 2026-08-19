"use client";

import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

const ITEMS = [
  {
    brand: "ZARA",
    name: "Lightweight Bomber Jacket",
    price: "$109",
    meta: "In stock · M",
  },
  {
    brand: "UNIQLO",
    name: "AIRism Cotton T-Shirt",
    price: "$30",
    meta: "In stock · M",
  },
  {
    brand: "COS",
    name: "Tapered Chino Trousers",
    price: "$119",
    meta: "In stock · 32R",
  },
  {
    brand: "ALDO",
    name: "Suede Loafers",
    price: "$120",
    meta: "In stock · 42",
  },
];

const TOTAL = 378;
const BUDGET = 500;

export function CompleteLook() {
  // The Save-look chip and the "Look 01 · Modern neutral" caption are baked
  // into complete/hero.jpg by the design export, so this card deliberately
  // renders no overlays of its own.
  const pct = Math.round((TOTAL / BUDGET) * 100);

  return (
    <section className="lnd-complete">
      <div className="lnd-container">
        <Reveal className="lnd-complete__head">
          <div>
            <p className="lnd-eyebrow">The complete look</p>
            <h2 className="lnd-h2" style={{ marginTop: "1rem" }}>
              Not just inspiration.
              <br />A look you can buy.
            </h2>
          </div>
          <p className="lnd-body lnd-body--wide">
            Every generated direction becomes a practical shopping list. These
            retailer matches are examples, not sponsored placements.
          </p>
        </Reveal>

        <div className="lnd-complete__grid">
          <Reveal>
            <div className="lnd-complete__photo">
              <Photo
                src="/landing/complete/hero.jpg"
                alt="A complete styled look shown on the person"
                ratio="811 / 1400"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="lnd-bill">
              <span className="lnd-badge">Spring &amp; Summer</span>

              <div className="lnd-bill__top">
                <h3 className="lnd-h3">Modern neutral</h3>
                <span className="lnd-bill__total">
                  <em>Total</em>
                  <strong>${TOTAL}</strong>
                </span>
              </div>

              <div className="lnd-rows">
                {ITEMS.map((item, i) => (
                  <div className="lnd-row" key={item.name}>
                    <Photo
                      src={`/landing/complete/item-${i + 1}.jpg`}
                      alt={`${item.brand} ${item.name}`}
                      ratio="800 / 451"
                    />
                    <span>
                      <span className="lnd-row__meta">{item.brand}</span>
                      <br />
                      <span className="lnd-row__name">{item.name}</span>
                      <br />
                      <span className="lnd-row__meta">{item.meta}</span>
                    </span>
                    <span className="lnd-row__side">
                      <span className="lnd-row__price">{item.price}</span>
                      <button type="button" className="lnd-chip">
                        Change
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              <div className="lnd-meter">
                <div className="lnd-meter__label">
                  <span>Your budget</span>
                  <span>${BUDGET}</span>
                </div>
                <div
                  className="lnd-meter__track"
                  role="progressbar"
                  aria-valuenow={TOTAL}
                  aria-valuemin={0}
                  aria-valuemax={BUDGET}
                  aria-label="Budget used"
                >
                  <div
                    className="lnd-meter__fill"
                    style={{ "--w": `${pct}%` } as React.CSSProperties}
                  />
                </div>
                <p className="lnd-fine" style={{ marginTop: "0.5rem" }}>
                  ${BUDGET - TOTAL} left for accessories
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
