"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics/client";
import { wrapOutboundUrl } from "@/lib/affiliate";
import { money } from "@/lib/format";
import type { Hotspot, Look, Product } from "@/lib/types";

/**
 * The hotspot experience.
 *
 * Interaction is TAP-FIRST, because mobile is a first-class target:
 * - Tap a marker → its card opens. Tap it again, tap outside, or press Escape
 *   → it closes.
 * - Hover also opens the card, but only on devices that genuinely support
 *   hover (checked with a media query), so touch devices never get stuck
 *   hover states.
 * - Every marker is a real <button> at least 44px square, so it works with
 *   touch and with a keyboard.
 *
 * Positioning: markers sit inside percentage-based zone boxes (see
 * src/lib/hotspots.ts) so they hold at any screen size. The popup card is
 * rendered as a child of the IMAGE CONTAINER rather than of the zone, and is
 * anchored left / centre / right depending on which third of the image the
 * zone falls in. That guarantees it can never overflow the image — a
 * centre-anchored card on a right-edge zone (e.g. a bag) would run off screen
 * on a narrow phone.
 */
export function HotspotImage({
  look,
  currency,
}: {
  look: Look;
  currency: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setCanHover(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openId]);

  const productFor = (id: string): Product | undefined =>
    look.items.find((p) => p.id === id);

  function open(productId: string) {
    setOpenId(productId);
    track("hotspot_opened", {
      lookId: look.id,
      productId,
      retailer: productFor(productId)?.retailer,
    });
  }

  const activeHotspot = look.hotspots.find((h) => h.productId === openId);
  const activeProduct = openId ? productFor(openId) : undefined;

  return (
    <div ref={containerRef} className="relative select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={look.imageUrl}
        alt={`Visualization of the ${look.name} outfit`}
        className="w-full border hairline bg-[var(--color-wash)] object-cover"
      />

      {/* Markers */}
      {look.hotspots.map((hotspot) => {
        const product = productFor(hotspot.productId);
        if (!product) return null;
        const isOpen = openId === product.id;

        return (
          <div
            key={hotspot.productId}
            className="absolute"
            style={{
              left: `${hotspot.zone.x}%`,
              top: `${hotspot.zone.y}%`,
              width: `${hotspot.zone.w}%`,
              height: `${hotspot.zone.h}%`,
            }}
            onMouseEnter={canHover ? () => open(product.id) : undefined}
            onMouseLeave={canHover ? () => setOpenId(null) : undefined}
          >
            <button
              type="button"
              aria-label={`${product.category}: ${product.name}, ${money(
                product.price,
                currency,
              )} at ${product.retailer}`}
              aria-expanded={isOpen}
              onClick={(e) => {
                e.stopPropagation();
                if (isOpen) setOpenId(null);
                else open(product.id);
              }}
              className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`block h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.55)] transition-transform ${
                  isOpen
                    ? "scale-125 bg-[var(--color-ink)]"
                    : "bg-white/85 hover:scale-110"
                }`}
              />
            </button>
          </div>
        );
      })}

      {/* Card — one at a time, anchored to the container so it always fits. */}
      {activeHotspot && activeProduct && (
        <ProductCard
          product={activeProduct}
          hotspot={activeHotspot}
          currency={currency}
          lookId={look.id}
          onClose={() => setOpenId(null)}
          onMouseEnter={canHover ? () => setOpenId(activeProduct.id) : undefined}
          onMouseLeave={canHover ? () => setOpenId(null) : undefined}
        />
      )}

      <p className="label pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/85 px-3 py-1.5">
        Tap a dot to shop the piece
      </p>
    </div>
  );
}

function ProductCard({
  product,
  hotspot,
  currency,
  lookId,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  product: Product;
  hotspot: Hotspot;
  currency: string;
  lookId: string;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { zone } = hotspot;
  const centerX = zone.x + zone.w / 2;
  const centerY = zone.y + zone.h / 2;

  // Horizontal anchor: hug the nearest edge for zones near the sides so the
  // card is always fully inside the image.
  const horizontal: React.CSSProperties =
    centerX < 34
      ? { left: 0 }
      : centerX > 66
        ? { right: 0 }
        : { left: "50%", transform: "translateX(-50%)" };

  // Vertical: below the zone when it sits high, above it when it sits low.
  const below = centerY < 55;
  const vertical: React.CSSProperties = below
    ? { top: `calc(${zone.y + zone.h}% + 0.5rem)` }
    : { bottom: `calc(${100 - zone.y}% + 0.5rem)` };

  return (
    <div
      role="dialog"
      aria-label={product.name}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ ...horizontal, ...vertical }}
      className="absolute z-20 w-[min(15rem,calc(100%-1rem))] border border-[var(--color-ink)] bg-white p-3 shadow-lg"
    >
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt=""
          className="h-20 w-16 shrink-0 border hairline object-cover"
        />
        <div className="min-w-0">
          <p className="label truncate">{product.retailer}</p>
          <p className="mt-1 text-[0.875rem] leading-snug">{product.name}</p>
          <p className="mt-1.5 text-[0.9375rem] font-medium">
            {money(product.price, currency)}
          </p>
        </div>
      </div>

      <a
        href={wrapOutboundUrl(product)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track("retailer_clicked", {
            lookId,
            productId: product.id,
            retailer: product.retailer,
            source: "hotspot",
          })
        }
        className="btn mt-3 w-full !min-h-[2.75rem] !px-2 !text-[0.75rem]"
      >
        Shop at {product.retailer}
      </a>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center text-lg leading-none text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        ×
      </button>
    </div>
  );
}
