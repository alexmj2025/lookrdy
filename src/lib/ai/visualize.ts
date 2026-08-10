import "server-only";
import { getOpenAI, IMAGE_MODEL, isMock } from "./client";
import type { Bundle } from "@/lib/types";

// ============================================================================
// PIPELINE STEP 4 — VISUALIZE.
//
// Generates an image of the user wearing an ALREADY-COMPOSED bundle.
//
// This module deliberately takes a validated `Bundle` and has no access to the
// catalog or to retrieval — it is structurally incapable of running before
// composition. That enforces the core rule: we never generate an outfit image
// first and look for matching products afterwards.
//
// The user's photo is passed in as bytes, used for this one request, and never
// written to disk, Supabase, or logs.
// ============================================================================

export interface VisualizeInput {
  bundle: Bundle;
  /** Raw user photo bytes, or null to render a neutral figure. */
  photo: { data: Buffer; mimeType: string } | null;
  occasion: string;
}

function describeOutfit(bundle: Bundle): string {
  return bundle.items
    .map((i) => `${i.category}: ${i.color} ${i.name.toLowerCase()}`)
    .join("; ");
}

function buildPrompt(bundle: Bundle, occasion: string): string {
  return `Full-body editorial fashion photograph of this person wearing this exact outfit, dressed for ${occasion}.

Outfit — ${describeOutfit(bundle)}.

Keep the person's face, hair, skin tone, and body proportions faithful to the reference photo. Standing, front-facing, full body visible from head to shoes. Plain light grey studio backdrop, soft even lighting, natural pose. Photorealistic, sharp, magazine quality. No text, no logos, no watermarks.`;
}

export async function visualize(input: VisualizeInput): Promise<string> {
  if (isMock()) return placeholderImage(input.bundle);

  const client = getOpenAI();
  const prompt = buildPrompt(input.bundle, input.occasion);

  try {
    if (input.photo) {
      // Image edit: the user's photo is the reference the outfit is rendered
      // onto. Bytes are held in memory only for this call.
      const file = await toFile(input.photo);
      const result = await client.images.edit({
        model: IMAGE_MODEL,
        image: file,
        prompt,
        size: "1024x1536",
      });
      const b64 = result.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
    } else {
      const result = await client.images.generate({
        model: IMAGE_MODEL,
        prompt: `${prompt}\n\nRender a neutral, anonymous model.`,
        size: "1024x1536",
      });
      const b64 = result.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
    }
  } catch (err) {
    // A failed visualization must not lose the composed outfit — the products
    // are the real value. Fall back to the placeholder and keep going.
    console.warn(
      `[visualize] generation failed, using placeholder: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  return placeholderImage(input.bundle);
}

async function toFile(photo: { data: Buffer; mimeType: string }) {
  const { toFile: makeFile } = await import("openai");
  const ext = photo.mimeType.includes("png") ? "png" : "jpg";
  return makeFile(photo.data, `reference.${ext}`, { type: photo.mimeType });
}

// ---------------------------------------------------------------------------
// Placeholder visualization (MOCK_AI=1, or when generation fails).
//
// A neutral figure wearing blocked-in garment regions that line up with the
// hotspot zones in src/lib/hotspots.ts, so the hotspot interaction is fully
// testable without spending image credits.
// ---------------------------------------------------------------------------

function placeholderImage(bundle: Bundle): string {
  const has = (c: string) => bundle.items.some((i) => i.category === c);
  const colorOf = (c: string) =>
    bundle.items.find((i) => i.category === c)?.color ?? "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <rect width="400" height="600" fill="#eceae7"/>
  <g stroke="#111" fill="none" stroke-width="1.25">
    <circle cx="200" cy="72" r="30"/>
    <path d="M200 102 L200 128"/>
    ${
      has("jacket")
        ? `<path d="M152 132 L128 148 L112 300 L142 306 L148 236 L148 480 L252 480 L252 236 L258 306 L288 300 L272 148 L248 132 Z" fill="#dedbd6"/>
           <path d="M200 132 L188 480 M200 132 L212 480" stroke-width="0.75"/>`
        : `<path d="M158 134 Q200 152 242 134 L272 152 L286 250 L254 260 L254 470 L146 470 L146 260 L114 250 L128 152 Z" fill="#e4e1dc"/>`
    }
    ${
      has("jacket")
        ? `<path d="M182 128 Q200 142 218 128" fill="#e4e1dc"/>`
        : ""
    }
    <path d="M150 480 L152 512 L166 588 L196 588 L198 512 L202 512 L204 588 L234 588 L248 512 L250 480 Z" fill="#d8d5d0"/>
    <path d="M152 500 L248 500" stroke-width="0.6"/>
    <rect x="152" y="558" width="42" height="26" rx="5" fill="#c9c6c1"/>
    <rect x="206" y="558" width="42" height="26" rx="5" fill="#c9c6c1"/>
    ${
      has("bag")
        ? `<rect x="272" y="286" width="62" height="78" rx="4" fill="#d2cfca"/><path d="M280 286 Q303 250 326 286" fill="none"/>`
        : ""
    }
    ${has("accessory") ? `<rect x="164" y="52" width="72" height="16" rx="3" fill="#d2cfca"/>` : ""}
  </g>
  <text x="200" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="#8d8a85">PREVIEW VISUALIZATION</text>
  <text x="200" y="596" text-anchor="middle" font-family="Georgia, serif" font-size="9" letter-spacing="1.5" fill="#8d8a85">${escapeXml(
    [colorOf("top"), colorOf("trousers"), colorOf("shoes")]
      .filter(Boolean)
      .join(" · "),
  )}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (ch) =>
    ch === "<"
      ? "&lt;"
      : ch === ">"
        ? "&gt;"
        : ch === "&"
          ? "&amp;"
          : ch === '"'
            ? "&quot;"
            : "&apos;",
  );
}
