import "server-only";
import { getOpenAI, IMAGE_MODEL, isMock } from "./client";
import type { Bundle } from "@/lib/types";
import { preserveProtectedPixels } from "./protectedEdit";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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
  mask?: Buffer;
}

function describeOutfit(bundle: Bundle): string {
  return bundle.items
    .map((i) => `${i.category}: ${i.name}; ${i.variantSelectionRequired ? "colour variant not confirmed; this is a style approximation" : i.color}; ${(i.visualDetails ?? []).join("; ")}`)
    .join("; ");
}

function buildPrompt(bundle: Bundle, occasion: string): string {
  return `Edit only the selected clothing areas in the FIRST reference photo for ${occasion}. It is the identity and scene reference, not inspiration for a new photograph.

Outfit — ${describeOutfit(bundle)}.

Preserve the original face, expression, hair, skin, body shape, pose, hands, camera angle, framing, background and lighting. Do not beautify, restyle, reposition or change the person. Fit the garments to their existing body and pose. Only replace the masked clothing. Preserve known fabric, pattern, cut and construction details. Additional reference images, when present, show the garments in outfit order; reproduce those garments. Unknown attributes are not verified product details. Do not add extra garments, accessories, text or watermarks.`;
}

export async function visualize(input: VisualizeInput): Promise<{ imageUrl: string; previewStatus: "ready" | "unavailable" | "demo"; previewNotice: string }> {
  const notice = "Approximate AI preview. Garment details and fit may differ; verify the selected variant on Simons.ca.";
  if (isMock()) return { imageUrl: placeholderImage(input.bundle), previewStatus: "demo", previewNotice: "Demo preview — live image generation is disabled." };

  const client = getOpenAI();
  const prompt = buildPrompt(input.bundle, input.occasion);

  try {
    if (input.photo) {
      // Image edit: the user's photo is the reference the outfit is rendered
      // onto. Bytes are held in memory only for this call.
      const file = await toFile(input.photo);
      // Only approved, repository-owned assets are read. No arbitrary URL fetches.
      const references = await Promise.all(input.bundle.items.map(async (item) => {
        const path = item.generationImageUrl;
        if (!path || !/^\/simons\/products\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(path)) return null;
        return toFile({ data: await readFile(join(process.cwd(), "public", path)), mimeType: path.endsWith("png") ? "image/png" : path.endsWith("webp") ? "image/webp" : "image/jpeg" });
      }));
      const result = await client.images.edit({
        model: IMAGE_MODEL,
        image: [file, ...references.filter((r): r is NonNullable<typeof r> => r !== null)],
        ...(input.mask ? { mask: await toFile({ data: input.mask, mimeType: "image/png" }) } : {}),
        ...(/^gpt-image-1(?:\.5)?$/.test(IMAGE_MODEL) ? { input_fidelity: "high" as const } : {}),
        quality: "medium",
        prompt,
        size: "1024x1536",
      }, { timeout: 180_000, maxRetries: 0 });
      const b64 = result.data?.[0]?.b64_json;
      if (b64) {
        const output = input.mask ? await preserveProtectedPixels(input.photo.data, Buffer.from(b64, "base64"), input.mask) : Buffer.from(b64, "base64");
        return { imageUrl: `data:image/png;base64,${output.toString("base64")}`, previewStatus: "ready", previewNotice: notice };
      }
    } else {
      const result = await client.images.generate({
        model: IMAGE_MODEL,
        prompt: `${prompt}\n\nRender a neutral, anonymous model.`,
        size: "1024x1536",
      });
      const b64 = result.data?.[0]?.b64_json;
      if (b64) return { imageUrl: `data:image/png;base64,${b64}`, previewStatus: "ready", previewNotice: notice };
    }
  } catch (err) {
    // A failed visualization must not lose the composed outfit — the products
    // are the real value. Keep the product list and report a preview failure.
    console.warn(
      `[visualize] generation failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  return { imageUrl: "", previewStatus: "unavailable", previewNotice: "Preview could not be generated. Your selected products are still available below; please try again." };
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
