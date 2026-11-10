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
  assert.equal(accountReturnPath("//example.com"), "/saved");
  assert.equal(accountReturnPath("https://example.com"), "/saved");
});
