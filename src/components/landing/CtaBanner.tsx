"use client";

import Link from "next/link";
import { track } from "@/lib/analytics/client";
import { Reveal } from "./Reveal";
import { Logo } from "@/components/Logo";

export function CtaBanner() {
  return (
    <section className="lnd-cta" id="contact">
      <div className="lnd-container">
        <Reveal className="lnd-cta__panel">
          {/* The only dark surface on the page, so the only place the white
              wordmark variant belongs. */}
          <Logo variant="white" height={24} className="lnd-cta__mark" />
          <p className="lnd-eyebrow">Ready when you are</p>
          <h2 className="lnd-h2">Your next outfit is one photo away.</h2>
          <p className="lnd-body">
            Upload a photo, pick the occasion, and get three complete looks you
            can actually buy &mdash; in about 90 seconds.
          </p>
          <div className="lnd-cta__actions">
            <Link
              href="/create"
              className="lnd-btn lnd-btn--light"
              onClick={() => track("started")}
            >
              Create my looks
            </Link>
            <a href="#how-it-works" className="lnd-btn lnd-btn--ghost">
              See how it works
            </a>
          </div>
          <p className="lnd-fine">
            Free to try &middot; No account required &middot; Your photo is
            never stored
          </p>
        </Reveal>
      </div>
    </section>
  );
}
