"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "./icons";

const CARDS = [
  { slug: "first-date", label: "First date" },
  { slug: "vacation", label: "Vacation" },
  { slug: "dinner", label: "Dinner" },
  { slug: "job-interview", label: "Job interview" },
  { slug: "event", label: "Event" },
];

export function Occasions() {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 4);
    setAtEnd(rail.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const step = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * rail.clientWidth * 0.7, behavior: "smooth" });
  };

  /* Drag-to-scroll. Pointer capture keeps the gesture alive if the cursor
     leaves the rail mid-drag. */
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // native touch scrolling is better
    const rail = railRef.current;
    if (!rail) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: rail.scrollLeft,
      moved: 0,
    };
    rail.dataset.dragging = "true";
    rail.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(dx);
    rail.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    drag.current.active = false;
    delete rail.dataset.dragging;
    if (rail.hasPointerCapture(e.pointerId)) {
      rail.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <section className="lnd-occ">
      <div className="lnd-container">
        <Reveal className="lnd-occ__head">
          <div>
            <p className="lnd-eyebrow">For wherever life takes you</p>
            <h2 className="lnd-h2" style={{ marginTop: "1rem" }}>
              One stylist.
              <br />
              Every occasion.
            </h2>
          </div>
          <div className="lnd-occ__bar">
            <p className="lnd-body lnd-body--wide">
              Swipe through a few places Lookrdy can take the uncertainty out of
              getting dressed.
            </p>
            <div className="lnd-occ__nav">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={atStart}
                aria-label="Previous occasions"
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={atEnd}
                aria-label="More occasions"
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={80}>
        <div
          className="lnd-occ__rail"
          ref={railRef}
          onScroll={sync}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {CARDS.map((card) => (
            <article className="lnd-occ__card" key={card.slug}>
              <div className="lnd-occ__frame">
                <Photo
                  src={`/landing/occasions/${card.slug}.jpg`}
                  alt={`An outfit styled for ${card.label.toLowerCase()}`}
                  ratio="789 / 1400"
                />
              </div>
              <div className="lnd-occ__foot">
                <span>{card.label}</span>
                <ArrowUpRight size={14} />
              </div>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
