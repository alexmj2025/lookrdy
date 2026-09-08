"use client";

import Link from "next/link";
import { useState } from "react";
import { track } from "@/lib/analytics/client";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";
import { ArrowRight, ArrowUp, Close, Sparkle } from "./icons";

const OCCASIONS = ["Dinner", "Wedding", "Interview", "Travel"];

const ITEMS = [
  { brand: "COS", name: "Leather Loafers", price: "$170" },
  { brand: "ADIDAS", name: "Original Low Shoes", price: "$100" },
  { brand: "UNIQLO", name: "Cotton T-shirt", price: "$29" },
];

export function HowItWorks() {
  const [occasion, setOccasion] = useState("Dinner");

  return (
    <section className="lnd-steps" id="how-it-works">
      <div className="lnd-container">
        <div className="lnd-steps__grid">
          {/* Sticky on desktop; drops to static below 1024px. */}
          <Reveal className="lnd-steps__aside">
            <p className="lnd-eyebrow">How it works</p>
            <h2 className="lnd-h2">
              One photo,
              <br />
              Three looks,
              <br />
              Zero effort
            </h2>
            <p className="lnd-body">
              From &ldquo;I have nothing to wear&rdquo; to a complete, shoppable
              outfit in minutes.
            </p>
          </Reveal>

          <div className="lnd-steps__list">
            <Reveal className="lnd-step">
              <div className="lnd-step__copy">
                <p className="lnd-step__num">01</p>
                <h3 className="lnd-h3">
                  Tell us what&rsquo;s
                  <br />
                  happening.
                </h3>
                <p className="lnd-body">
                  Upload a full-body photo and choose the occasion, your vibe,
                  and an optional budget.
                </p>
                <div className="lnd-chips">
                  {OCCASIONS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="lnd-chip"
                      data-on={occasion === item}
                      aria-pressed={occasion === item}
                      onClick={() => setOccasion(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lnd-mock" aria-hidden="true">
                <div className="lnd-mock__bar">
                  <span>New style session</span>
                  <Close size={12} />
                </div>
                <div className="lnd-mock__body">
                  <div className="lnd-drop">
                    <span className="lnd-drop__icon">
                      <ArrowUp size={16} />
                    </span>
                    <strong>Add your photo</strong>
                    <span className="lnd-row__meta">
                      Full body, good light
                    </span>
                  </div>
                  <p
                    className="lnd-row__meta"
                    style={{ marginTop: "0.75rem", textAlign: "center" }}
                  >
                    Private to you &middot; deleted after
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="lnd-step" delay={80}>
              <div className="lnd-step__copy">
                <p className="lnd-step__num">02</p>
                <h3 className="lnd-h3">
                  Meet your
                  <br />
                  three looks.
                </h3>
                <p className="lnd-body">
                  Three distinct outfit directions, personalized to you, plus
                  one clear recommendation.
                </p>
                <span className="lnd-badge">
                  <Sparkle size={12} /> Refine your looks
                </span>
              </div>

              <div className="lnd-cluster">
                <Photo
                  src="/landing/steps/look-main.jpg"
                  alt="Recommended outfit direction"
                />
                <Photo
                  src="/landing/steps/look-a.jpg"
                  alt="Second outfit direction"
                />
                <Photo
                  src="/landing/steps/look-b.jpg"
                  alt="Third outfit direction"
                />
              </div>
            </Reveal>

            <Reveal className="lnd-step" delay={160}>
              <div className="lnd-step__copy">
                <p className="lnd-step__num">03</p>
                <h3 className="lnd-h3">
                  Recreate it
                  <br />
                  for real.
                </h3>
                <p className="lnd-body">
                  See every piece as a real, purchasable product matched to your
                  budget and location.
                </p>
                <Link
                  href="/create"
                  className="lnd-link"
                  onClick={() => track("started")}
                >
                  Create your looks <ArrowRight size={14} />
                </Link>
              </div>

              <div className="lnd-rows">
                {ITEMS.map((item, i) => (
                  <div className="lnd-row" key={item.name}>
                    <Photo
                      src={`/landing/steps/item-${i + 1}.jpg`}
                      alt={`${item.brand} ${item.name}`}
                      ratio="513 / 465"
                    />
                    <span>
                      <span className="lnd-row__meta">{item.brand}</span>
                      <br />
                      <span className="lnd-row__name">{item.name}</span>
                    </span>
                    <span className="lnd-row__price">{item.price}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
