"use client";

import type { WardrobePick } from "./wardrobe";

async function load(src: string) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

/** The selfie is drawn as-is, without generative edits, stretching, or cropping. */
export async function buildWardrobeBoard(selfie: string, outfit: WardrobePick): Promise<string> {
  const [portrait, ...garments] = await Promise.all([selfie, ...outfit.items.map((item) => item.image)].map(load));
  const canvas = document.createElement("canvas");
  canvas.width = 960; canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export is unavailable on this device.");
  const contain = (image: HTMLImageElement, x: number, y: number, width: number, height: number) => {
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    ctx.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h);
  };
  ctx.fillStyle = "#f6f3ee"; ctx.fillRect(0, 0, 960, 1200);
  ctx.fillStyle = "#24211f"; ctx.font = "600 26px sans-serif"; ctx.fillText("LOOKRDY  /  MY WARDROBE", 36, 54);
  ctx.font = "600 40px sans-serif"; ctx.fillText(outfit.title, 36, 110, 880);
  ctx.fillStyle = "#e8e2d9"; ctx.fillRect(36, 150, 546, 970);
  contain(portrait, 36, 150, 546, 970);
  const rowHeight = 970 / garments.length;
  garments.forEach((image, index) => {
    const top = 150 + rowHeight * index;
    ctx.fillStyle = "#fff"; ctx.fillRect(608, top, 316, rowHeight - 10);
    contain(image, 620, top + 8, 292, rowHeight - 58);
    ctx.fillStyle = "#24211f"; ctx.font = "500 22px sans-serif";
    ctx.fillText(outfit.items[index].name, 622, top + rowHeight - 24, 286);
  });
  ctx.fillStyle = "#5d5752"; ctx.font = "22px sans-serif";
  ctx.fillText("Original photo  ·  Outfit plan", 36, 1160);
  return canvas.toDataURL("image/jpeg", 0.87);
}
