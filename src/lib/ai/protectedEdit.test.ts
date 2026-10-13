import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { preserveProtectedPixels, validateEditPhoto } from "./protectedEdit";
const png = (data: number[], width = 2, height = 1) => sharp(Buffer.from(data), {
  raw: { width, height, channels: 4 },
}).png().toBuffer();
test("protected pixels are exact; only selected clothing is replaced", async () => {
  const source = await png([15, 25, 35, 255, 45, 55, 65, 255]);
  const edit = await png([200, 201, 202, 255, 210, 211, 212, 255]);
  const mask = await png([0, 0, 0, 255, 0, 0, 0, 0]);
  await validateEditPhoto(source, mask);
  const result = await preserveProtectedPixels(source, edit, mask);
  assert.deepEqual([...await sharp(result).raw().toBuffer()], [15, 25, 35, 255, 210, 211, 212, 255]);
});
test("reject empty and fully editable masks", async () => {
  const source = await png([15, 25, 35, 255, 45, 55, 65, 255]);
  for (const alpha of [0, 255]) await assert.rejects(validateEditPhoto(source,
    await png([0, 0, 0, alpha, 0, 0, 0, alpha])));
});
test("reject mismatched mask dimensions", async () => {
  await assert.rejects(validateEditPhoto(await png([15, 25, 35, 255, 45, 55, 65, 255]),
    await png([0, 0, 0, 255], 1, 1)));
});
test("blend edges while retaining original alpha", async () => {
  const output = await preserveProtectedPixels(await png([0, 0, 0, 255, 10, 20, 30, 255]),
    await png([255, 255, 255, 255, 200, 200, 200, 255]), await png([0, 0, 0, 128, 0, 0, 0, 255]));
  assert.deepEqual([...await sharp(output).raw().toBuffer()], [127, 127, 127, 255, 10, 20, 30, 255]);
});
