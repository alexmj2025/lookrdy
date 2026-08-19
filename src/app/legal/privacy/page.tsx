/**
 * TEMPLATE. Written to match how the app actually handles data today, but it
 * has not been reviewed by a lawyer. Have counsel review before launch, and
 * fill in the placeholders marked [ ] below. If data handling changes, this
 * page must change with it.
 */
import type { Metadata } from "next";
import Link from "next/link";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Lookrdy",
  description: "What Lookrdy collects, why, and what happens to your photo.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro="What we collect, why we collect it, and what happens to the photo you upload."
      updated="Last updated 18 August 2026"
    >
      <div className="lnd-prose__note">
        <p>
          <strong>Draft for review.</strong> This document has not yet been
          reviewed by legal counsel. Placeholders in square brackets need
          completing, and the retention periods below must be confirmed against
          the live system before launch.
        </p>
      </div>

      <h2>The short version</h2>
      <ul>
        <li>Your photo is used to generate your looks. That’s it.</li>
        <li>We don’t sell it, publish it, or use it to train models.</li>
        <li>We don’t require an account to try the service.</li>
        <li>You can ask us to delete your data at any time.</li>
      </ul>

      <h2>Who is responsible</h2>
      <p>
        The data controller is [legal entity name], [registered address],
        [company number]. For privacy questions contact{" "}
        <a href="mailto:privacy@lookrdy.com">privacy@lookrdy.com</a>.
      </p>

      <h2>What we collect</h2>
      <h3>The photo you upload</h3>
      <p>
        A photo of yourself, which under data protection law is biometric-
        adjacent personal data and is treated as sensitive. It is processed to
        produce your outfit visualizations.
      </p>
      <h3>What you tell us about the occasion</h3>
      <p>
        The occasion, style preferences, budget and location you enter. Used to
        select products and shape the looks.
      </p>
      <h3>Usage data</h3>
      <p>
        Which steps of the flow you reach, which looks you view, and which
        retailer links you click. Used to understand where the product works and
        where it doesn’t.
      </p>
      <h3>Technical data</h3>
      <p>
        IP address, browser and device type, and timestamps, collected in
        ordinary server logs and used for security and debugging.
      </p>

      <h2>Why we’re allowed to process it</h2>
      <ul>
        <li>
          <strong>Your consent</strong> — for the photo. You give it by
          uploading, and you can withdraw it at any time by asking us to delete.
        </li>
        <li>
          <strong>Performance of a contract</strong> — to deliver the looks you
          asked for.
        </li>
        <li>
          <strong>Legitimate interests</strong> — for security, fraud
          prevention, and improving the service, balanced against your rights.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          <strong>Your photo</strong> — retained only as long as needed to
          generate and show your looks, then deleted [confirm exact period].
        </li>
        <li>
          <strong>Generated looks</strong> — kept while you can still access
          them, then deleted [confirm exact period].
        </li>
        <li>
          <strong>Usage and technical data</strong> — retained in aggregated or
          pseudonymised form for [period].
        </li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We use third-party processors to run the service. Each is bound by a
        data processing agreement and may only act on our instructions:
      </p>
      <ul>
        <li>
          <strong>[AI provider]</strong> — generates the outfit visualizations.
          Photos sent for generation are not used by them to train models under
          our agreement [confirm].
        </li>
        <li>
          <strong>[Hosting and database provider]</strong> — stores application
          data. Hosted in [region].
        </li>
      </ul>
      <p>
        We do not sell personal data, and we do not share it with advertisers.
        Clicking a retailer link takes you to that retailer’s own site, where
        their privacy policy applies.
      </p>

      <h2>International transfers</h2>
      <p>
        Where data is transferred outside [the UK/EEA], we rely on [Standard
        Contractual Clauses / an adequacy decision] to protect it.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you can ask us to give you a copy of your
        data, correct it, delete it, restrict or object to its processing, or
        port it elsewhere. You can also withdraw consent for the photo at any
        time. Email{" "}
        <a href="mailto:privacy@lookrdy.com">privacy@lookrdy.com</a> and we will
        respond within one month.
      </p>
      <p>
        If you think we’ve got something wrong you can complain to your local
        data protection authority — in the UK, the Information Commissioner’s
        Office.
      </p>

      <h2>Children</h2>
      <p>
        Lookrdy is not for anyone under 16. We do not knowingly process
        children’s photos. If you believe a child has uploaded a photo, contact
        us and we will delete it.
      </p>

      <h2>Cookies</h2>
      <p>
        Covered separately in our <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>

      <h2>Changes</h2>
      <p>
        We’ll update this page when our practices change, and revise the date at
        the top. Material changes will be signalled in the service.
      </p>
    </PageShell>
  );
}
