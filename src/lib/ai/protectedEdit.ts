import sharp from "sharp";

/** Alpha 255 protects the source; alpha 0 allows generated clothing. */
export async function validateEditPhoto(data: Buffer, mask: Buffer) {
  const options = { limitInputPixels: 16_000_000 };
  const source = await sharp(data, options).metadata();
  const selection = await sharp(mask, options).metadata();
  if (source.format !== "png" || selection.format !== "png" || !selection.hasAlpha
    || !source.width || !source.height || source.width !== selection.width
    || source.height !== selection.height || Math.max(source.width, source.height) > 1152) {
    throw new Error("Please save the clothing selection again before generating.");
  }
  const pixels = await sharp(mask, options).ensureAlpha().raw().toBuffer();
  let editable = 0, protectedPixels = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 255) editable++;
    if (pixels[i] === 255) protectedPixels++;
  }
  if (!editable || !protectedPixels) throw new Error("Select clothing only and leave your face and background unpainted.");
}

/** Enforce protection in pixels, rather than relying on the model's mask adherence. */
export async function preserveProtectedPixels(source: Buffer, generated: Buffer, mask: Buffer): Promise<Buffer> {
  const { data: original, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const edited = await sharp(generated).resize(info.width, info.height, { fit: "fill" }).ensureAlpha().raw().toBuffer();
  const alpha = await sharp(mask).ensureAlpha().raw().toBuffer();
  const output = Buffer.from(original);
  for (let i = 0; i < output.length; i += 4) {
    const protectedWeight = alpha[i + 3] / 255;
    for (let c = 0; c < 3; c++) output[i + c] = Math.round(original[i + c] * protectedWeight + edited[i + c] * (1 - protectedWeight));
  }
  return sharp(output, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}
