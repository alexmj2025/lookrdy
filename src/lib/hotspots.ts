import type { Bundle, Category, Hotspot, HotspotZone } from "./types";

// ============================================================================
// HOTSPOT ZONES.
//
// The visualization is AI-generated and carries no coordinate data, so we do
// NOT attempt garment detection on the image. Instead each category maps to an
// approximate body region, expressed as percentages of the rendered image box
// so placement holds at every screen size.
//
// ⚠️ These numbers are meant to be tuned. Once you've reviewed real generated
// images, nudge them here — it's the only place they're defined.
//
// Integration boundary: refined hotspot detection. If you later run a
// segmentation model over the generated image, replace `zonesFor()` with a
// function that returns detected boxes in the same percentage format; nothing
// downstream changes.
// ============================================================================

export const ZONES: Record<Category, HotspotZone> = {
  // x/y are the top-left corner; all values are % of image width/height.
  accessory: { x: 38, y: 9, w: 24, h: 9 },
  jacket: { x: 22, y: 20, w: 56, h: 30 },
  top: { x: 36, y: 24, w: 28, h: 20 },
  trousers: { x: 34, y: 50, w: 32, h: 30 },
  shoes: { x: 33, y: 83, w: 34, h: 12 },
  bag: { x: 66, y: 46, w: 22, h: 20 },
};

/**
 * When a bundle has both a jacket and a top, the jacket covers the torso, so
 * the top's marker is nudged to the visible neckline/collar area instead of
 * sitting underneath the jacket's box.
 */
const TOP_UNDER_JACKET: HotspotZone = { x: 43, y: 15, w: 14, h: 8 };

export function zonesFor(bundle: Bundle): Hotspot[] {
  const hasJacket = bundle.items.some((i) => i.category === "jacket");

  return bundle.items.map((product) => {
    let zone = ZONES[product.category];
    if (product.category === "top" && hasJacket) zone = TOP_UNDER_JACKET;
    return { productId: product.id, category: product.category, zone };
  });
}
