"use client";

import type { GenerationResult, StyleRequest } from "./types";

/**
 * Session-scoped client state.
 *
 * The user's PHOTO is deliberately kept in a module-level variable, not in
 * any browser storage — it lives in memory for this tab only, is sent to our
 * server once for the generation call, and disappears on refresh or when
 * cleared. It is never written to disk on either side.
 *
 * The request is small and goes in sessionStorage. The generated RESULT goes
 * in IndexedDB, not sessionStorage: a real gpt-image-1 response is a base64
 * PNG data URL that can run into the hundreds of KB to a few MB, and three of
 * them in one result routinely exceeds sessionStorage's ~5-10MB per-origin
 * quota. When that happened, the previous version's fallback silently
 * stripped every image before storing — the looks would render with correct
 * titles, prices and rationale but no visualization, which is exactly the
 * failure this file now avoids. IndexedDB's quota is a large fraction of
 * available disk space, so this isn't a real constraint here.
 */

const REQUEST_KEY = "lookrdy:request";
const DB_NAME = "lookrdy";
const STORE = "result";
const RESULT_KEY = "current";

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

// --- Result storage (IndexedDB) --------------------------------------------

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

/** In-memory mirror so a same-tab read right after a write never round-trips. */
let memoResult: GenerationResult | null = null;

export async function setResult(result: GenerationResult): Promise<void> {
  memoResult = result;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(result, RESULT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB unavailable (private browsing on some browsers, storage
    // disabled) — the in-memory copy above still lets this tab work until
    // navigated away or refreshed.
  }
}

export async function getResult(): Promise<GenerationResult | null> {
  if (memoResult) return memoResult;
  try {
    const db = await openDb();
    const result = await new Promise<GenerationResult | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(RESULT_KEY);
      req.onsuccess = () => resolve((req.result as GenerationResult) ?? null);
      req.onerror = () => reject(req.error);
    });
    memoResult = result;
    return result;
  } catch {
    return null;
  }
}

export async function clearResult(): Promise<void> {
  memoResult = null;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(RESULT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* no-op */
  }
}
