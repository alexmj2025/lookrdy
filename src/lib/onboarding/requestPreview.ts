"use client";

import { getPhoto, getResult, setResult } from "@/lib/flowStore";
import type { GenerationResult, Look } from "@/lib/types";
import { preparePhotoUpload } from "./preparePhotoUpload";
import { catalogSnapshot, storeLibraryLook } from "./library";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

let previewInFlight = false;

export async function requestPreview(result: GenerationResult, look: Look): Promise<void> {
  if (previewInFlight || look.imageUrl) return;
  const settings = result.previewRequest;
  const photo = getPhoto();
  if (!settings || !photo) throw new Error("Start a new outfit search to attach your photo again.");

  previewInFlight = true;
  const updateLook = async (changes: Partial<Look>) => {
    const latest = await getResult();
    if (!latest || latest.previewRequest !== settings) return;
    await setResult({
      ...latest,
      looks: latest.looks.map((item) => item.id === look.id ? { ...item, ...changes } : item),
    });
  };
  try {
    // Updating the in-memory result announces the pending state immediately.
    void updateLook({ previewStatus: "pending", previewNotice: "Creating your preview…" });
    const form = new FormData();
    form.set("occasion", settings.occasion);
    form.set("budgetMin", String(settings.budgetMin));
    form.set("budgetMax", String(settings.budgetMax));
    form.set("avoidText", settings.avoidText);
    form.set("previewLookId", look.id);
    if (settings.trialId) form.set("trialId", settings.trialId);
    for (const item of look.items) form.append("previewItemId", item.id);
    form.set("photo", await preparePhotoUpload(photo.file, photo.preview));

    const response = await fetch("/api/generate", { method: "POST", body: form });
    const data = await response.json() as { look?: Look; message?: string };
    if (!response.ok || data.look?.id !== look.id) {
      await updateLook({ previewStatus: "unavailable", previewNeedsAccount: response.status === 403, previewNotice: data.message ?? "The preview could not be displayed. Check provider usage before trying again." });
      return;
    }
    await updateLook({ ...data.look, previewNeedsAccount: false });
    if (data.look.previewStatus === "ready") {
      try {
        if ((await getSupabaseBrowser().auth.getSession()).data.session) {
          const entry = catalogSnapshot(result, data.look);
          await storeLibraryLook(entry.key, "simons", entry.snapshot);
        }
      } catch {
        await updateLook({ previewNotice: "Preview ready. It couldn’t be added to account history; use Save look to try again." });
      }
    }
  } catch {
    await updateLook({ previewStatus: "unavailable", previewNotice: "The preview request did not finish in this tab. Check provider usage before requesting another image." });
  } finally {
    previewInFlight = false;
  }
}
