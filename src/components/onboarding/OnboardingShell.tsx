"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { ProgressBar } from "./ProgressBar";

/**
 * One persistent frame around every onboarding step. Steps swap their content
 * inside it, so the header, progress and panel never remount — the flow reads
 * as one continuous surface rather than five separate pages.
 */
export function OnboardingShell({
  step,
  totalSteps,
  onSkip,
  children,
}: {
  step: number;
  totalSteps: number;
  /** Rendered top-right. Only steps that can genuinely be skipped pass this. */
  onSkip?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="onb">
      <div className="onb-shell">
        <header className="onb-topbar">
          <Link href="/" className="onb-topbar__mark" aria-label="Lookrdy home">
            <Logo height={22} priority />
          </Link>

          <ProgressBar step={step} totalSteps={totalSteps} />

          <div className="onb-topbar__end">
            {onSkip && (
              <button type="button" className="onb-btn onb-btn--quiet" onClick={onSkip}>
                Skip for now
              </button>
            )}
          </div>
        </header>

        <div className="onb-panel">{children}</div>
      </div>
    </div>
  );
}
