import test from "node:test";
import assert from "node:assert/strict";
import { accountReturnPath } from "./accountPaths";
import { styleWardrobe, type WardrobeItem } from "./wardrobe";

const wardrobe: WardrobeItem[] = [
  { id: "1", slot: "top", name: "White shirt", image: "local:white" },
  { id: "2", slot: "top", name: "Blue tee", image: "local:blue" },
  { id: "3", slot: "bottom", name: "Charcoal trousers", image: "local:trousers" },
  { id: "4", slot: "shoes", name: "Black loafers", image: "local:loafers" },
  { id: "5", slot: "layer", name: "Navy blazer", image: "local:blazer" },
];

test("wardrobe styling ranks relevant complete looks and only selects owned photos", () => {
  const picks = styleWardrobe(wardrobe, "A polished outfit for dinner");
  assert.equal(picks.length, 3);
  assert.deepEqual(picks[0].items.map((item) => item.id), ["1", "3", "4", "5"]);
  assert.ok(picks.every((pick) => pick.items.every((item) => wardrobe.includes(item))));
});

test("wardrobe suggestions respect exclusions and refuse incomplete base looks", () => {
  assert.ok(styleWardrobe(wardrobe, "Dinner without navy blazer").every((pick) => pick.items.every((item) => item.id !== "5")));
  assert.deepEqual(styleWardrobe([wardrobe[0]], "Casual weekend"), []);
  assert.equal(styleWardrobe([{ id: "6", slot: "dress", name: "Green dress", image: "local:dress" }], "Party").length, 1);
});

test("account returns are limited to local workspace routes", () => {
  assert.equal(accountReturnPath("/looks/look-2"), "/looks/look-2");
  assert.equal(accountReturnPath("/wardrobe"), "/wardrobe");
  assert.equal(accountReturnPath("/collections"), "/collections");
  assert.equal(accountReturnPath("/settings"), "/settings");
  assert.equal(accountReturnPath("//example.com"), "/saved");
  assert.equal(accountReturnPath("https://example.com"), "/saved");
});

test("wardrobe color requests rank outfits using the garment swatches", () => {
  const pieces: WardrobeItem[] = [
    { id: "1", slot: "top", name: "Shirt", image: "local:shirt", swatch: "#ca2832" },
    { id: "2", slot: "bottom", name: "Jeans", image: "local:jeans", swatch: "#2460ac" },
    { id: "3", slot: "bottom", name: "Trousers", image: "local:trousers", swatch: "#424242" },
  ];
  const [match] = styleWardrobe(pieces, "Which colors work together?");
  assert.deepEqual(match.items.map(({ id }) => id), ["1", "3"]);
  assert.match(match.description, /neutral pieces anchor/);
});
