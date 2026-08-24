import type { Metadata } from "next";
import Link from "next/link";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";
import { PolicyMeta } from "@/components/landing/PolicyMeta";
import { CookieSettingsLink } from "@/components/consent/CookieSettingsLink";

export const metadata: Metadata = {
  title: "Cookie Policy — Lookrdy",
  description:
    "How Lookrdy uses cookies and similar technologies, and how to change your choices.",
};

export default function CookiePage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Cookie Policy"
      intro="This Cookie Policy explains how Lookrdy uses cookies and similar technologies on https://lookrdy.com and in related web experiences."
      updated="Effective date: August 23, 2026 · Last updated: August 23, 2026"
    >
      <p>
        It should be read with our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>.
      </p>

      <h2>1. What cookies and similar technologies are</h2>
      <p>
        Cookies are small text files stored on a browser or device. Similar
        technologies include local storage, pixels, tags, SDKs, referral
        identifiers, and server-to-server events. Some are set by Lookrdy and
        others are set by service providers, retailers, or affiliate networks.
      </p>
      <p>
        Session technologies expire when a browser session ends. Persistent
        technologies remain until their stated expiry or until deleted. Their
        actual duration depends on purpose, provider configuration, and your
        browser settings.
      </p>

      <h2>2. Why we use them</h2>
      <p>
        <strong>Strictly necessary</strong> technologies support sign-in,
        session continuity, security, fraud prevention, network management,
        payment flow, load balancing, and storage of your privacy choices. These
        cannot always be disabled through our consent tool because the Service
        may not function without them.
      </p>
      <p>
        <strong>Preference</strong> technologies remember language, region,
        interface settings, and choices you ask us to retain.
      </p>
      <p>
        <strong>Analytics and performance</strong> technologies help us
        understand visits, feature use, errors, speed, and aggregated conversion
        funnels. Where consent is required, these remain off until you allow
        them.
      </p>
      <p>
        <strong>Affiliate and attribution</strong> technologies record that a
        user clicked a retailer link, associate a qualifying purchase with
        Lookrdy, calculate commissions, and prevent referral fraud. They may be
        set by a retailer or affiliate network and are subject to that
        party&rsquo;s policies.
      </p>
      <p>
        <strong>Advertising or targeting</strong> technologies are not necessary
        for the core Service. If Lookrdy introduces them, we will provide any
        required notice, consent control, and opt-out before use.
      </p>

      <h2>3. The information involved</h2>
      <p>
        Depending on the technology, information may include an identifier, IP
        address, browser and device type, operating system, language,
        approximate region, referring page, pages or features used, timestamps,
        session activity, campaign or referral code, retailer click, and
        conversion or commission status. Lookrdy does not place an uploaded
        personal photo inside a cookie.
      </p>

      <h2>4. Your consent and choices</h2>
      <p>
        Where applicable law requires consent, optional analytics, affiliate, or
        advertising technologies will remain disabled until you choose to allow
        them. You can change or withdraw your choice at any time through the{" "}
        <CookieSettingsLink>cookie settings control</CookieSettingsLink> on{" "}
        <a href="https://lookrdy.com">https://lookrdy.com</a>. Withdrawal does
        not make earlier lawful processing unlawful.
      </p>
      <p>
        You can also block or delete cookies through browser settings. Blocking
        necessary technologies may prevent sign-in, payment, security, or saved
        choices from working. Blocking affiliate tracking should not increase
        the price you pay, but Lookrdy may not receive attribution or
        commission.
      </p>
      <p>
        Where legally required and technically supported, Lookrdy will process
        recognized opt-out preference signals such as Global Privacy Control. A
        browser&rsquo;s Do Not Track setting is not handled consistently across
        the industry; we respond where required by law.
      </p>

      <h2>5. Third parties</h2>
      <p>
        Service providers may use technologies to provide authentication,
        hosting, security, analytics, payment, communications, error monitoring,
        or consent management. Retailers and affiliate networks may use referral
        identifiers, cookies, pixels, or server events after you follow a
        retailer link. Those parties determine some purposes and retention
        periods under their own privacy notices.
      </p>
      <p>
        Lookrdy will identify specific non-essential providers in its cookie
        settings interface when they are active and when disclosure is required.
        The absence of a named provider in this Policy does not authorize
        Lookrdy to activate optional tracking without the consent required by
        law.
      </p>

      <h2>6. Retention</h2>
      <p>
        We retain cookie and event information only as long as reasonably
        necessary for the relevant security, preference, analytics, attribution,
        fraud-prevention, legal, or accounting purpose. Individual cookie expiry
        information will be shown in the website&rsquo;s cookie settings
        interface where available. Affiliate transaction and consent records may
        be kept longer when needed to verify commissions, prove consent choices,
        handle disputes, or comply with law.
      </p>

      <h2>7. Updates and contact</h2>
      <p>
        We may update this Policy when technologies, providers, law, or the
        Service change. We will post the revised date and provide additional
        notice where required.
      </p>
      <ul>
        <li>
          <strong>Questions or privacy requests:</strong>{" "}
          <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>
        </li>
        <li>
          <strong>Business address:</strong> Lookrdy will publish its business
          address before accepting paid orders.
        </li>
      </ul>

      <PolicyMeta current="cookie" />
    </PageShell>
  );
}
