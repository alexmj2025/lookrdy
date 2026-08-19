/**
 * TEMPLATE. The cookie table below must be verified against what the app
 * actually sets before launch — an inaccurate cookie table is itself a
 * compliance problem. Not reviewed by legal counsel.
 */
import type { Metadata } from "next";
import Link from "next/link";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";

export const metadata: Metadata = {
  title: "Cookie Policy — Lookrdy",
  description: "Which cookies and similar technologies Lookrdy uses, and why.",
};

export default function CookiesPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Cookie Policy"
      intro="Which cookies and similar storage Lookrdy uses, what each one is for, and how to turn them off."
      updated="Last updated 18 August 2026"
    >
      <div className="lnd-prose__note">
        <p>
          <strong>Draft for review.</strong> The inventory below must be checked
          against what the application actually sets before this page goes live,
          and reviewed by legal counsel.
        </p>
      </div>

      <h2>What cookies are</h2>
      <p>
        Cookies are small files a site stores in your browser. Similar
        technologies — local storage and session storage — do much the same job.
        We use the word “cookies” below to cover all of them.
      </p>

      <h2>What we use</h2>

      <h3>Strictly necessary</h3>
      <p>
        Required for the service to work. These cannot be switched off, and no
        consent is required for them.
      </p>
      <ul>
        <li>
          <strong>Session state</strong> — keeps your place in the styling flow
          between the photo, brief and results steps. Expires when you close the
          browser.
        </li>
        <li>
          <strong>Security</strong> — protects against cross-site request
          forgery and abusive traffic.
        </li>
      </ul>

      <h3>Analytics</h3>
      <p>
        Helps us see which steps people complete and where they drop out, so we
        can fix what isn’t working. We use first-party event logging rather than
        a third-party advertising tracker, and we do not build advertising
        profiles.
      </p>
      <ul>
        <li>
          <strong>Funnel events</strong> — records that a step happened, not who
          you are. Retained for [period].
        </li>
      </ul>

      <h3>What we don’t use</h3>
      <p>
        No advertising cookies, no cross-site tracking pixels, and no data
        sharing with ad networks.
      </p>

      <h2>Third parties</h2>
      <p>
        Following a link to a retailer takes you to their site, which will set
        its own cookies under its own policy. We have no control over those.
      </p>

      <h2>Managing cookies</h2>
      <p>
        Every major browser lets you block or delete cookies in its settings.
        Blocking strictly necessary cookies will stop the styling flow from
        working correctly — the service needs to remember your place between
        steps.
      </p>

      <h2>More</h2>
      <p>
        How we handle personal data generally is covered in our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>. Questions:{" "}
        <a href="mailto:privacy@lookrdy.com">privacy@lookrdy.com</a>.
      </p>
    </PageShell>
  );
}
