"use client";

import type { FunnelEvent } from "@/lib/types";

/**
 * Client-side funnel emitter. Fire-and-forget — a failed analytics call must
 * never interrupt what the user is doing.
 */
export function track(
  event: FunnelEvent,
  properties: Record<string, unknown> = {},
): void {
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
