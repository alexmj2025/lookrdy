"use client";

import type { FunnelEvent } from "@/lib/types";
import { isAllowed } from "@/components/consent/consent-store";

/**
 * Client-side funnel emitter. Fire-and-forget — a failed analytics call must
 * never interrupt what the user is doing.
 */
export function track(
  event: FunnelEvent,
  properties: Record<string, unknown> = {},
): void {
  // Funnel events are analytics, and the Cookie Policy commits to keeping
  // optional analytics disabled until the user allows them. No consent, no
  // event — this is the enforcement point for all ~15 call sites.
  if (!isAllowed("analytics")) return;

  try {
    const body = JSON.stringify({ event, properties });

    // sendBeacon survives navigation, which matters for retailer_clicked.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/events",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }

    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* no-op */
  }
}
