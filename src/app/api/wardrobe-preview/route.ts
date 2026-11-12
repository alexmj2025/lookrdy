import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/lib/supabase/server";
import { imageSettings } from "@/lib/ai/imageSettings";
import { preparePhoto } from "@/lib/ai/preparePhoto";
import { editWithNanoBanana } from "@/lib/ai/falEdit";
import { encodePreview } from "@/lib/ai/visualize";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!await getSupabaseSession()) {
    return NextResponse.json({ message: "Sign in to try on an outfit from your wardrobe." }, { status: 401 });
  }
  if (imageSettings().engine !== "fal") {
    return NextResponse.json({ message: "Live wardrobe try-on is temporarily unavailable." }, { status: 503 });
  }

  let images;
  let brief: string;
  let labels: string[];
  try {
    const form = await request.formData();
    const garments = form.getAll("garment");
    const files = [form.get("portrait"), ...garments];
    if (garments.length < 1 || garments.length > 4 || files.some((file) => !(file instanceof File) || !file.size || file.size > 1_500_000)) {
      throw new Error("Invalid photos");
    }
    labels = form.getAll("label").map((value) => String(value).slice(0, 60));
    if (labels.length !== garments.length) throw new Error("Missing garment labels");
    brief = String(form.get("brief") ?? "").slice(0, 300);
    images = await Promise.all((files as File[]).map(async (file) => preparePhoto(Buffer.from(await file.arrayBuffer()))));
  } catch {
    return NextResponse.json({ message: "Use a clear full-body photo and up to four garment photos in JPG, PNG, or WebP." }, { status: 400 });
  }

  const prompt = `Edit the clothing on the person in the FIRST image only. Preserve their face, identity, expression, hair, skin, body shape, pose, hands, camera angle, lighting and background. Each remaining image is an exact reference for one owned item, in this order: ${labels.join("; ")}. Dress the person in those items, matching their colors, fit, fabric, patterns and construction as closely as possible. Do not add items that aren't shown. Keep original clothing in any areas the references do not cover. Use the user's request only to guide how the referenced items are styled: ${JSON.stringify(brief)}.`;
  try {
    const imageUrl = await encodePreview(await editWithNanoBanana(process.env.FAL_KEY!.trim(), prompt, images));
    return NextResponse.json({ imageUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("[wardrobe-preview]", error instanceof Error ? error.message : "Image edit failed.");
    return NextResponse.json({ message: "The try-on could not be generated. Your outfit suggestion is still available." }, { status: 502 });
  }
}
