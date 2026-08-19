/**
 * Builds the landing page photography from the Figma exports.
 *
 *   node scripts/ingest-landing-photos.mjs
 *
 * Sources live in the repo root's public/img/ with meaningless export names
 * ("image 29.png", "Frame 1000004959.png"), so the mapping below is by
 * content — each entry was identified by opening the file. Outputs go to
 * lookrdy/public/landing/, which is what <Photo> reads.
 *
 * Nothing is cropped. The comp's own proportions are correct (hero cards
 * really are tall and narrow, product tiles really are landscape), so images
 * are only scaled down. Alpha is flattened onto the tile's own background
 * colour, sampled from its top-left pixel, so the rounded-corner product
 * tiles keep their exact tint instead of getting white corners.
 */

import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const APP = resolve(here, "..");
const SRC = resolve(APP, "..", "public", "img");
const OUT = join(APP, "public", "landing");

/** Longest edge, in pixels, per category. */
const PORTRAIT_MAX = 1400;
const TILE_MAX = 800;

const MAP = [
  // Hero rail — same man, white studio, 394x884
  ["image 6-1.png", "hero/original.jpg", PORTRAIT_MAX],
  ["Frame 1000004959.png", "hero/look-casual.jpg", PORTRAIT_MAX],
  ["image 20-1.png", "hero/look-smart.jpg", PORTRAIT_MAX],
  ["image 23-1.png", "hero/look-date.jpg", PORTRAIT_MAX],

  // Still you, just styled — same woman, ~1600 tall
  ["image 6.png", "styled/before.jpg", PORTRAIT_MAX],
  ["Frame 1000004960.png", "styled/everyday.jpg", PORTRAIT_MAX],
  ["image 24-1.png", "styled/office.jpg", PORTRAIT_MAX],
  ["image 25-1.png", "styled/date.jpg", PORTRAIT_MAX],

  // How it works, step 02 cluster
  ["image 20.png", "steps/look-main.jpg", PORTRAIT_MAX],
  ["image 19.png", "steps/look-a.jpg", PORTRAIT_MAX],
  ["image 21.png", "steps/look-b.jpg", PORTRAIT_MAX],

  // How it works, step 03 product tiles
  ["image 21-1.png", "steps/item-1.jpg", TILE_MAX],
  ["image 22.png", "steps/item-2.jpg", TILE_MAX],
  ["image 23.png", "steps/item-3.jpg", TILE_MAX],

  // The complete look
  ["Background.png", "complete/hero.jpg", PORTRAIT_MAX],
  ["image 24.png", "complete/item-1.jpg", TILE_MAX],
  ["image 25.png", "complete/item-2.jpg", TILE_MAX],
  ["image 26.png", "complete/item-3.jpg", TILE_MAX],
  ["image 27.png", "complete/item-4.jpg", TILE_MAX],

  // Occasions rail, in comp order
  ["image 29.png", "occasions/first-date.jpg", PORTRAIT_MAX],
  ["image 33.png", "occasions/vacation.jpg", PORTRAIT_MAX],
  ["image 32.png", "occasions/dinner.jpg", PORTRAIT_MAX],
  ["image 31.png", "occasions/job-interview.jpg", PORTRAIT_MAX],
  ["image 34.png", "occasions/event.jpg", PORTRAIT_MAX],
];

/** The colour to flatten transparency onto: the source's own top-left pixel. */
async function backdrop(file) {
  const { data } = await sharp(file)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

const kb = (n) => `${(n / 1024).toFixed(0)}kb`;

async function main() {
  let missing = 0;
  let inBytes = 0;
  let outBytes = 0;

  for (const [name, slot, max] of MAP) {
    const from = join(SRC, name);
    const to = join(OUT, slot);

    if (!existsSync(from)) {
      console.error(`MISSING  ${name}`);
      missing += 1;
      continue;
    }

    mkdirSync(dirname(to), { recursive: true });

    const pipeline = sharp(readFileSync(from)).rotate();
    const meta = await pipeline.metadata();
    const portrait = meta.height >= meta.width;

    await pipeline
      .resize({
        width: portrait ? null : max,
        height: portrait ? max : null,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: await backdrop(from) })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(to);

    const after = await sharp(to).metadata();
    inBytes += statSync(from).size;
    outBytes += statSync(to).size;

    console.log(
      `${slot.padEnd(28)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)}` +
        ` -> ${String(after.width).padStart(4)}x${String(after.height).padEnd(4)}` +
        ` ${kb(statSync(from).size).padStart(7)} -> ${kb(statSync(to).size).padStart(6)}`,
    );
  }

  console.log(
    `\n${MAP.length - missing}/${MAP.length} written · ${kb(inBytes)} in -> ${kb(outBytes)} out`,
  );
  if (missing) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
