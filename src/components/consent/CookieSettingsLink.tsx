"use client";

import type { ReactNode } from "react";
import { openConsentSettings } from "./CookieConsent";

/**
 * Reopens the cookie settings dialog. The Cookie Policy promises the choice
 * can be changed or withdrawn at any time, so this needs to be reachable from
 * both the footer and the policy text itself.
 */
export function CookieSettingsLink({
  children = "Cookie settings",
  className = "ck-trigger",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      {children}
    </button>
  );
}
