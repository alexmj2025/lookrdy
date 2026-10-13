import test from "node:test";
import assert from "node:assert/strict";
import { consumeGeneration } from "./generationStream";
import { getResult } from "../flowStore";
import type { GenerationResult } from "../types";

Object.defineProperty(globalThis, "window", { value: new EventTarget(), configurable: true });
const seed = (): GenerationResult => ({
  looks: [{ id: "look-1", name: "Safe", descriptors: [], rationale: "", recommended: true,
    items: [], total: 250, imageUrl: "", hotspots: [], previewStatus: "pending" }],
  constraints: { occasion: "Dinner", formalityMin: 1, formalityMax: 5, styleTags: [], colors: [], exclusions: [],
    budget: 450, currency: "CAD", location: "Canada", country: "CA", requiredCategories: [] },
  request: { occasion: "Dinner", desiredLook: "", budget: 450, currency: "CAD", location: "Canada", exclusions: "" },
  engine: "mock", generationsUsed: 1, generationsAllowed: 3,
});
function response(events: unknown[]) {
  const bytes = new TextEncoder().encode(events.map((event) => JSON.stringify(event) + "\n").join(""));
  return new Response(new ReadableStream({ start(controller) {
    // Deliberately split records across network chunk boundaries.
    for (let i = 0; i < bytes.length; i += 17) controller.enqueue(bytes.slice(i, i + 17));
    controller.close();
  } }));
}
test("product lists arrive before previews and completed previews update the stored result", async () => {
  const result = seed(); let pendingAtNavigation = false;
  await consumeGeneration(response([{ type: "result", result },
    { type: "look", look: { ...result.looks[0], previewStatus: "ready", imageUrl: "data:image/png;base64,test" } },
    { type: "done" }]), (r) => { pendingAtNavigation = r.looks[0].previewStatus === "pending"; });
  assert.equal(pendingAtNavigation, true);
  assert.equal((await getResult())?.looks[0].previewStatus, "ready");
});
test("an interrupted stream marks unfinished previews unavailable without losing products", async () => {
  await consumeGeneration(response([{ type: "result", result: seed() }]), () => {});
  const result = await getResult();
  assert.equal(result?.looks[0].previewStatus, "unavailable");
  assert.equal(result?.looks[0].total, 250);
});
test("a response ending before product lists arrive fails visibly", async () => {
  await assert.rejects(consumeGeneration(response([]), () => {}));
});
