"use client";

import type { GenerationResult, StyleRequest } from "./types";

/**
 * Session-scoped client state.
 *
 * The user's PHOTO is deliberately kept in a module-level variable, not in
 * sessionStorage — it lives in memory for this tab only, is sent to our server
 * once for the generation call, and disappears on refresh or when cleared. It
 * is never written to disk on either side.
 *
 * The request and the generated result do go in sessionStorage so navigating
 * between results and look detail doesn't re-run a generation.
 */

const REQUEST_KEY = "lookrdy:request";
const RESULT_KEY = "lookrdy:result";

let photoFile: File | null = null;
let photoPreview: string | null = null;

export function setPhoto(file: File, preview: string) {
  photoFile = file;
  photoPreview = preview;
}

export function getPhoto(): { file: File; preview: string } | null {
  return photoFile && photoPreview
    ? { file: photoFile, preview: photoPreview }
    : null;
}

export function clearPhoto() {
  photoFile = null;
  photoPreview = null;
}

export function hasPhoto(): boolean {
  return photoFile !== null;
}

export function setRequest(req: StyleRequest) {
  sessionStorage.setItem(REQUEST_KEY, JSON.stringify(req));
}

export function getRequest(): StyleRequest | null {
  try {
    const raw = sessionStorage.getItem(REQUEST_KEY);
    return raw ? (JSON.parse(raw) as StyleRequest) : null;
  } catch {
    return null;
  }
}

export function setResult(result: GenerationResult) {
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    // Generated images are data URLs and can be large; if the quota is hit,
    // keep the app working by storing everything except the imagery.
    const slim = {
      ...result,
      looks: result.looks.map((l) => ({ ...l, imageUrl: "" })),
    };
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(slim));
  }
}

export function getResult(): GenerationResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as GenerationResult) : null;
  } catch {
    return null;
  }
}

export function clearResult() {
  sessionStorage.removeItem(RESULT_KEY);
}
