import sharp from "sharp";

/** Normalize uploads without stretching or cropping the original pose. */
export async function preparePhoto(data: Buffer) {
  const source = sharp(data, { limitInputPixels: 32_000_000, failOn: "error" });
  const { format, pages } = await source.metadata();
  if (!format || !["jpeg", "png", "webp"].includes(format) || (pages ?? 1) > 1) {
    throw new Error("Unsupported photo format.");
  }
  const background = "#eceae7";
  return {
    data: await source
      .rotate()
      .flatten({ background })
      .resize(768, 1152, { fit: "contain", background })
      .jpeg({ quality: 90 })
      .toBuffer(),
    mimeType: "image/jpeg",
  };
}
