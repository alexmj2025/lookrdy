export const wardrobeSlots = [
  ["top", "Top"], ["bottom", "Bottom"], ["dress", "Dress or jumpsuit"], ["shoes", "Shoes"], ["layer", "Jacket or layer"],
] as const;
export type WardrobeSlot = typeof wardrobeSlots[number][0];
export type WardrobeItem = { id: string; name: string; slot: WardrobeSlot; image: string };
export type WardrobePick = { title: string; description: string; items: WardrobeItem[] };

const styles = [
  { title: "Polished", words: /formal|office|dinner|smart|polished|interview|work|elegant/i, garments: /blazer|loafer|trouser|shirt|tailor|dress|boot/i },
  { title: "Casual", words: /casual|relax|everyday|weekend|travel|comfort/i, garments: /denim|jean|tee|sneaker|knit|hoodie|flat/i },
  { title: "Statement", words: /bold|statement|party|colour|color/i, garments: /red|print|stripe|pattern|bright|green|purple/i },
];

export function styleWardrobe(items: WardrobeItem[], brief: string, limit = 3): WardrobePick[] {
  const filter = (slot: WardrobeSlot) => items.filter((item) => item.slot === slot);
  const stylesForBrief = styles.find((style) => style.words.test(brief));
  const extras = (slot: WardrobeSlot) => filter(slot).length ? filter(slot) : [undefined];
  const bases = [
    ...filter("dress").map((dress) => [dress]),
    ...filter("top").flatMap((top) => filter("bottom").map((bottom) => [top, bottom])),
  ];
  const avoid = brief.match(/(?:avoid|without|no)\s+([a-z]+(?:[- ][a-z]+)?)/i)?.[1]?.trim().toLowerCase();
  const candidates = bases.flatMap((base) => extras("shoes").flatMap((shoes) =>
    [undefined, ...filter("layer")].map((layer) => [...base, ...[shoes, layer].filter((item): item is WardrobeItem => Boolean(item))])));
  const ranked = candidates.filter((pieces) => !avoid || !pieces.some((item) => item.name.toLowerCase().includes(avoid)))
    .map((pieces) => ({
      pieces,
      score: pieces.reduce((score, item) =>
        score + (stylesForBrief?.garments.test(item.name) ? 4 : 0) +
        (brief.toLowerCase().includes(item.name.toLowerCase()) ? 3 : 0), 0) +
        (stylesForBrief?.title === "Polished" && pieces.some((item) => item.slot === "layer") ? 2 : 0),
    })).sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map(({ pieces }, index) => ({
    title: index === 0 && stylesForBrief ? `${stylesForBrief.title} wardrobe look` : `Wardrobe look ${index + 1}`,
    description: `Start with ${pieces[0].name}${pieces[1] ? ` and pair it with ${pieces.slice(1).map((item) => item.name).join(", ")}` : ""}. Every piece shown is from your photos.`,
    items: pieces,
  }));
}
