/**
 * TEMPLATE. Written to be accurate about how Lookrdy actually behaves, but it
 * has not been reviewed by a lawyer. Have counsel review before launch, and
 * fill in the placeholders marked [ ] below.
 */
import type { Metadata } from "next";
import Link from "next/link";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";

export const metadata: Metadata = {
  title: "Terms of Use — Lookrdy",
  description: "The terms that govern your use of Lookrdy.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Use"
      intro="These terms govern your use of Lookrdy. By using the service you agree to them."
      updated="Last updated 18 August 2026"
    >
      <div className="lnd-prose__note">
        <p>
          <strong>Draft for review.</strong> This document has not yet been
          reviewed by legal counsel. Placeholders in square brackets need
          completing before launch.
        </p>
      </div>

      <h2>1. Who we are</h2>
      <p>
        Lookrdy (“Lookrdy”, “we”, “us”) is operated by [legal entity name],
        registered at [registered address], [company number]. You can reach us
        at <a href="mailto:hello@lookrdy.com">hello@lookrdy.com</a>.
      </p>

      <h2>2. The service</h2>
      <p>
        Lookrdy generates outfit suggestions from a photo you upload and details
        you provide about an occasion, your preferences and your budget. It
        returns visualizations of those outfits along with a list of matching
        products sold by third-party retailers.
      </p>
      <p>
        The service is provided for personal, non-commercial use. We may change,
        suspend or discontinue any part of it at any time.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 16 years old to use Lookrdy. By using it you
        confirm that you meet this requirement and that any information you give
        us is accurate.
      </p>

      <h2>4. Your content</h2>
      <p>
        You keep all rights in the photos you upload. You grant us a limited
        licence to process them solely to generate your looks and operate the
        service. We do not sell your photos, publish them, or use them to train
        models. See our <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
      <p>You confirm that, for every photo you upload:</p>
      <ul>
        <li>you are the person shown, or you have their explicit permission;</li>
        <li>you have the right to upload it;</li>
        <li>
          it does not depict a minor, and does not contain unlawful, obscene or
          infringing material.
        </li>
      </ul>
      <p>
        We may remove content and suspend accounts that breach these
        conditions.
      </p>

      <h2>5. AI-generated results</h2>
      <p>
        Outfit images are AI visualizations, not photographs of you wearing the
        garments. Fit, drape, colour and proportion are approximations and are
        not guaranteed. Styling suggestions are generated automatically and are
        offered as suggestions only. Full detail is in our{" "}
        <Link href="/legal/ai">AI Disclosure</Link>.
      </p>

      <h2>6. Products, prices and retailers</h2>
      <p>
        Lookrdy does not sell garments. Products shown are sold by third-party
        retailers, and any purchase is a contract between you and that retailer,
        governed by their terms.
      </p>
      <p>
        Prices, sizes and availability are drawn from catalogue data that may be
        out of date. Always confirm on the retailer’s own site before buying. We
        are not responsible for the accuracy of retailer information, nor for
        the quality, delivery or returns handling of anything you buy.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>upload photos of anyone without their permission;</li>
        <li>
          use the service to generate misleading imagery of an identifiable
          person;
        </li>
        <li>
          scrape, reverse engineer, or attempt to extract our catalogue or
          models;
        </li>
        <li>
          interfere with the service’s operation or circumvent any rate limit or
          security measure.
        </li>
      </ul>

      <h2>8. Intellectual property</h2>
      <p>
        The Lookrdy name, interface, and underlying software are ours or our
        licensors’. Nothing in these terms transfers any of those rights to you.
        Product imagery and brand names belong to their respective owners and
        appear for identification purposes only.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The service is provided “as is”. To the fullest extent permitted by law,
        we make no warranties about its accuracy, availability, or fitness for a
        particular purpose. Styling output is a matter of taste and we do not
        warrant that you will like or be satisfied with any result.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for indirect
        or consequential loss, or for any loss arising from purchases you make
        from third-party retailers. Nothing here limits liability that cannot be
        limited by law, including for death or personal injury caused by
        negligence, or for fraud.
      </p>
      <p>
        Where liability cannot be excluded, our total liability is limited to
        [the greater of the amount you paid us in the preceding 12 months, or
        [amount]].
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms. Material changes will be signalled by
        updating the date at the top of this page and, where appropriate, by
        notice in the service. Continuing to use Lookrdy after a change means
        you accept the revised terms.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are governed by the laws of [jurisdiction], and the courts
        of [jurisdiction] have exclusive jurisdiction, without affecting any
        mandatory consumer protections available to you where you live.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href="mailto:legal@lookrdy.com">legal@lookrdy.com</a>.
      </p>
    </PageShell>
  );
}
