import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { preparePhoto } from "./preparePhoto";

test("normalization fits the entire source photo without stretching or cropping", async () => {
  const input = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "red" },
  }).png().toBuffer();
  const photo = await preparePhoto(input);
  const { data, info } = await sharp(photo.data).raw().toBuffer({ resolveWithObject: true });
  assert.equal(photo.mimeType, "image/jpeg");
  assert.equal(info.width, 768);
  assert.equal(info.height, 1152);
  const pixel = (x: number, y: number) => [...data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3)];
  assert.ok(pixel(384, 64).every((value) => value > 200)); // padded top
  assert.ok(pixel(12, 210)[0] > 230 && pixel(12, 210)[1] < 20); // original square near its top-left
  assert.ok(pixel(756, 940)[0] > 230 && pixel(756, 940)[1] < 20); // original square near its bottom-right
  assert.ok(pixel(384, 1088).every((value) => value > 200)); // padded bottom
});

test("invalid bytes and unsupported formats are rejected before reaching the provider", async () => {
  await assert.rejects(preparePhoto(Buffer.from("not an image")));
  const gif = await sharp({ create: { width: 2, height: 2, channels: 3, background: "red" } }).gif().toBuffer();
  await assert.rejects(preparePhoto(gif), /Unsupported photo format/);
});
