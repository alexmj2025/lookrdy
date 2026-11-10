import { NANO_BANANA_MODEL } from "./imageSettings";

type ImageInput = { data: Buffer; mimeType: string };

/** Use inline media both ways; no separate public file upload or download. */
export async function editWithNanoBanana(
  key: string,
  prompt: string,
  images: ImageInput[],
  request: typeof fetch = fetch,
): Promise<Buffer> {
  let response: Response;
  try {
    response = await request(`https://fal.run/${NANO_BANANA_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
        "X-Fal-Store-IO": "0",
      },
      body: JSON.stringify({
        prompt,
        image_urls: images.map(({ data, mimeType }) => `data:${mimeType};base64,${data.toString("base64")}`),
        aspect_ratio: "2:3",
        num_images: 1,
        limit_generations: true,
        output_format: "png",
        sync_mode: true,
      }),
      signal: AbortSignal.timeout(120_000),
      redirect: "error",
    });
  } catch {
    throw new Error("fal image request could not complete.");
  }
  if (!response.ok) throw new Error(`fal image request returned HTTP ${response.status}.`);

  const result = await response.json().catch(() => null) as { images?: { url?: unknown }[] } | null;
  const output = result?.images?.[0]?.url;
  const prefix = "data:image/png;base64,";
  if (typeof output !== "string" || !output.startsWith(prefix) || output.length > 24_000_000) {
    throw new Error("fal did not return a supported inline preview.");
  }
  const png = Buffer.from(output.slice(prefix.length), "base64");
  if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error("fal did not return a valid PNG preview.");
  }
  const requestId = response.headers.get("x-fal-request-id") ?? response.headers.get("x-request-id");
  if (requestId && /^[a-f0-9-]{36}$/i.test(requestId)) {
    console.info(`[fal] image request completed: ${requestId}`);
  }
  return png;
}
