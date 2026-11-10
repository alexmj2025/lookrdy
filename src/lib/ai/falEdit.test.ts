import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { editWithNanoBanana } from "./falEdit";
import { imageSettings } from "./imageSettings";

test("Nano Banana uses one inline image request and returns the inline preview", async () => {
  const png = await sharp({ create: { width: 2, height: 3, channels: 3, background: "white" } }).png().toBuffer();
  const uri = `data:image/png;base64,${png.toString("base64")}`;
  const request: typeof fetch = async (url, init) => {
    assert.equal(url, "https://fal.run/fal-ai/nano-banana/edit");
    assert.equal(init?.method, "POST");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Authorization"), "Key test-key");
    assert.equal(headers.get("X-Fal-Store-IO"), "0");
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body.image_urls, [uri, uri]);
    assert.equal(body.aspect_ratio, "2:3");
    assert.equal(body.num_images, 1);
    assert.equal(body.limit_generations, true);
    assert.equal(body.sync_mode, true);
    return Response.json({ images: [{ url: uri }] });
  };
  const image = { data: png, mimeType: "image/png" };
  assert.deepEqual(await editWithNanoBanana("test-key", "Edit outfit", [image, image], request), png);
});

test("fal failures do not retry or include provider payloads in errors", async () => {
  let attempts = 0;
  const request: typeof fetch = async () => {
    attempts++;
    return new Response("sensitive request data", { status: 429 });
  };
  await assert.rejects(editWithNanoBanana("test-key", "Edit outfit", [], request),
    { message: "fal image request returned HTTP 429." });
  assert.equal(attempts, 1);
});

test("fal never downloads a hosted output when inline media is expected", async () => {
  const request: typeof fetch = async () => Response.json({ images: [{ url: "https://example.com/image.png" }] });
  await assert.rejects(editWithNanoBanana("test-key", "Edit outfit", [], request), /inline preview/);
});

test("provider is opt-in and does not fall back to a different paid provider", () => {
  assert.equal(imageSettings({ OPENAI_API_KEY: "example" }).engine, "openai");
  assert.equal(imageSettings({ IMAGE_PROVIDER: "fal", OPENAI_API_KEY: "example" }).engine, "mock");
  assert.equal(imageSettings({ IMAGE_PROVIDER: "typo", OPENAI_API_KEY: "example" }).engine, "mock");
  assert.equal(imageSettings({ IMAGE_PROVIDER: "fal", FAL_KEY: "example", MOCK_AI: "1" }).engine, "mock");
  const selected = imageSettings({ IMAGE_PROVIDER: "fal", FAL_KEY: "example" });
  assert.equal(selected.engine, "fal");
});
