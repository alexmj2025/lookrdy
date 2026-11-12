export const wardrobeSlots = [
  ["top", "Top"], ["bottom", "Bottom"], ["dress", "Dress or jumpsuit"], ["shoes", "Shoes"], ["layer", "Jacket or layer"],
] as const;
export type WardrobeSlot = typeof wardrobeSlots[number][0];
export type WardrobeItem = { id: string; name: string; slot: WardrobeSlot; image: string; swatch?: string };
export type WardrobePick = { title: string; description: string; items: WardrobeItem[] };

const styles = [
  { title: "Polished", words: /formal|office|dinner|smart|polished|interview|work|elegant/i, garments: /blazer|loafer|trouser|shirt|tailor|dress|boot/i },
  { title: "Casual", words: /casual|relax|everyday|weekend|travel|comfort/i, garments: /denim|jean|tee|sneaker|knit|hoodie|flat/i },
  { title: "Statement", words: /bold|statement|party/i, garments: /red|print|stripe|pattern|bright|green|purple/i },
];

function sampledColor(item: WardrobeItem) {
  const hex = item.swatch;
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const [red, green, blue] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  const delta = high - low;
  if (high < 55 || low > 213 || delta < 28) return { neutral: true, hue: 0 };
  const segment = high === red ? (green - blue) / delta : high === green ? 2 + (blue - red) / delta : 4 + (red - green) / delta;
  return { neutral: false, hue: (segment * 60 + 360) % 360 };
}

function paletteFit(items: WardrobeItem[]) {
  const colors = items.map(sampledColor).filter((color) => color !== null);
  const hues = colors.filter((color) => !color.neutral).map((color) => color.hue);
  if (!hues.length && colors.length > 1) return { score: 2, advice: "These pieces form a neutral palette. Mix textures to add definition." };
  if (hues.length === 1 && colors.length > 1) return { score: 5, advice: "Use the strongest color as an accent and let the neutral pieces anchor it." };
  if (hues.length > 1 && hues.every((hue) => Math.min(Math.abs(hue - hues[0]), 360 - Math.abs(hue - hues[0])) < 55)) {
    return { score: 4, advice: "These pieces sit in a similar color family. Mix lighter and darker shades for contrast." };
  }
  return { score: 0, advice: "Let one color lead, and keep the other visible in a smaller area to balance the outfit." };
}

export function styleWardrobe(items: WardrobeItem[], brief: string, limit = 3): WardrobePick[] {
  const filter = (slot: WardrobeSlot) => items.filter((item) => item.slot === slot);
  const stylesForBrief = styles.find((style) => style.words.test(brief));
  const extras = (slot: WardrobeSlot) => filter(slot).length ? filter(slot) : [undefined];
  const bases = [
    ...filter("dress").map((dress) => [dress]),
    ...filter("top").flatMap((top) => filter("bottom").map((bottom) => [top, bottom])),
  ];
  const avoid = brief.match(/(?:avoid|without|no)\s+([a-z]+(?:[- ][a-z]+)?)/i)?.[1]?.trim().toLowerCase();
  const colors = brief.toLowerCase().match(/\b(?:black|white|navy|blue|gray|grey|green|red|pink|purple|beige|cream|brown|orange|yellow|olive|burgundy)\b/g) ?? [];
  const colorRequest = /colou?r|palette|match|pair/i.test(brief);
  const candidates = bases.flatMap((base) => extras("shoes").flatMap((shoes) =>
    [undefined, ...filter("layer")].map((layer) => [...base, ...[shoes, layer].filter((item): item is WardrobeItem => Boolean(item))])));
  const ranked = candidates.filter((pieces) => !avoid || !pieces.some((item) => item.name.toLowerCase().includes(avoid)))
    .map((pieces) => ({
      pieces,
      score: pieces.reduce((score, item) =>
        score + (stylesForBrief?.garments.test(item.name) ? 4 : 0) +
        (brief.toLowerCase().includes(item.name.toLowerCase()) ? 3 : 0) +
        (colors.some((color) => item.name.toLowerCase().includes(color)) ? 4 : 0), 0) +
        (colorRequest ? paletteFit(pieces).score : 0) +
        (stylesForBrief?.title === "Polished" && pieces.some((item) => item.slot === "layer") ? 2 : 0),
    })).sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map(({ pieces }, index) => ({
    title: index === 0 && stylesForBrief ? `${stylesForBrief.title} wardrobe look` : `Wardrobe look ${index + 1}`,
    description: `Start with ${pieces[0].name}${pieces[1] ? ` and pair it with ${pieces.slice(1).map((item) => item.name).join(", ")}` : ""}. ${colorRequest ? paletteFit(pieces).advice : "Every piece shown is from your photos."}`,
    items: pieces,
  }));
}
