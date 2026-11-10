"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { GenerationResult, Look } from "@/lib/types";

export type LookSnapshot = {
  title: string;
  description: string;
  imageUrl?: string;
  items: { name: string; url?: string }[];
};
export type LookSource = "simons" | "wardrobe";
export type LibraryEntry = {
  entry_key: string;
  source: LookSource;
  snapshot: LookSnapshot;
  saved: boolean;
  created_at: string;
};

export function catalogSnapshot(result: GenerationResult, look: Look) {
  return {
    key: `${result.searchId ?? "legacy"}:${look.id}:${result.searchId ? "" : look.items.map((item) => item.id).join("-")}`,
    snapshot: {
      title: `${look.name} · ${result.request.occasion}`,
      description: look.rationale,
      imageUrl: look.previewStatus === "ready" ? look.imageUrl : undefined,
      items: look.items.map(({ name, productUrl }) => ({ name, url: productUrl })),
    },
  };
}

function fail(code?: string): never {
  if (code === "PGRST205" || code === "42P01") throw new Error("Saved looks aren’t set up yet. Ask the site owner to enable the library.");
  throw new Error("Your library couldn’t be updated. Please try again.");
}

export async function storeLibraryLook(key: string, source: LookSource, snapshot: LookSnapshot, save = false) {
  const client = getSupabaseBrowser();
  // The insert uses the authenticated user's default owner_id. An existing
  // favorite remains saved when a background history update adds its image.
  const { error: insertError } = await client.from("lookrdy_library")
    .upsert({ entry_key: key, source, snapshot, saved: save }, { onConflict: "owner_id,entry_key", ignoreDuplicates: true, defaultToNull: false });
  if (insertError) fail(insertError.code);
  const { error } = await client.from("lookrdy_library")
    .update({ snapshot, ...(save ? { saved: true } : {}) }).eq("entry_key", key);
  if (error) fail(error.code);
}

export async function readLibrary(): Promise<LibraryEntry[]> {
  const { data, error } = await getSupabaseBrowser().from("lookrdy_library")
    .select("entry_key,source,snapshot,saved,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) fail(error.code);
  return (data ?? []) as LibraryEntry[];
}

export async function updateLibraryFavorite(key: string, saved: boolean) {
  const { error } = await getSupabaseBrowser().from("lookrdy_library").update({ saved }).eq("entry_key", key);
  if (error) fail(error.code);
}

export async function deleteLibraryLook(key: string) {
  const { error } = await getSupabaseBrowser().from("lookrdy_library").delete().eq("entry_key", key);
  if (error) fail(error.code);
}

export function isLookPhoto(value?: string): value is string {
  return Boolean(value && /^data:image\/(?:jpeg|png|webp);base64,/.test(value));
}
