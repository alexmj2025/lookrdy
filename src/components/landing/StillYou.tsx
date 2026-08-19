"use client";

import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

const PANELS = [
  {
    src: "/landing/styled/before.jpg",
    alt: "A person taking a mirror photo at home",
    kind: "Before",
    label: "Take a photo",
    low: false,
  },
  {
    src: "/landing/styled/everyday.jpg",
    alt: "The same person styled in an everyday look",
    kind: "After",
    label: "Everyday look",
    low: true,
  },
  {
    src: "/landing/styled/office.jpg",
    alt: "The same person styled for the office",
    kind: "After",
    label: "Office style",
    low: true,
  },
  {
    src: "/landing/styled/date.jpg",
    alt: "The same person styled for a date night",
    kind: "After",
    label: "Date night",
    low: false,
  },
];

export function StillYou() {
  return (
    <section className="lnd-styled" id="looks">
      <div className="lnd-container">
        <Reveal className="lnd-styled__head">
          <p className="lnd-eyebrow">Personal, not generic</p>
          <h2 className="lnd-h2">Still you, just styled</h2>
          <p className="lnd-body">
            Lookrdy understands your photo, occasion, preferences and budget
            &mdash; then creates complete directions made for your real life.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="lnd-strip">
            {PANELS.map((panel, i) => (
              <button
                type="button"
                className="lnd-strip__panel"
                key={panel.label}
                aria-label={`${panel.kind}: ${panel.label}`}
                style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
              >
                <Photo src={panel.src} alt={panel.alt} />
                <span
                  className={[
                    "lnd-strip__chip",
                    panel.low ? "lnd-strip__chip--low" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <em>{panel.kind}</em>
                  <span>{panel.label}</span>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
