"use client";

import { track } from "@/lib/analytics/client";

/**
 * Named onboarding events.
 *
 * BACKEND BOUNDARY (vendor): these deliberately do not know about any
 * analytics vendor. They forward to src/lib/analytics/client.ts, which posts
 * to /api/events and is already gated on the visitor's analytics-cookie
 * consent. Point that one file at a vendor and every event below follows.
 */

export type OnboardingEvent =
  | "onboarding_started"
  | "photo_uploaded"
  | "occasion_selected"
  | "budget_selected"
  | "country_selected"
  | "style_selected"
  | "generation_started"
  | "generation_completed"
  | "look_selected"
  | "product_clicked"
  | "free_generation_used"
  | "paywall_viewed"
  | "signup_started"
  | "credits_selected";

export function trackOnboarding(
  event: OnboardingEvent,
  properties: Record<string, unknown> = {},
): void {
  // The shared FunnelEvent union predates these names; the events endpoint
  // accepts the string either way.
  track(event as never, properties);
}
