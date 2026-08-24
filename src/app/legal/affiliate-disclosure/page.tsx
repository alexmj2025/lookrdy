import type { Metadata } from "next";
import Link from "next/link";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";
import { PolicyMeta } from "@/components/landing/PolicyMeta";

export const metadata: Metadata = {
  title: "Affiliate Disclosure — Lookrdy",
  description:
    "How Lookrdy's affiliate relationships work and how they affect recommendations.",
};

export default function AffiliateDisclosurePage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Affiliate Disclosure"
      updated="Effective date: August 23, 2026 · Last updated: August 23, 2026"
    >
      <h2>1. Our affiliate relationships</h2>
      <p>
        Lookrdy helps users compare style directions and find similar products
        offered by third-party retailers. Some links to retailers are affiliate
        links. If you click an affiliate link and make a qualifying purchase or
        take another qualifying action, Lookrdy, doing business as lookrdy, may
        receive a commission, referral fee, or other compensation from the
        retailer or affiliate network.
      </p>
      <p>
        You generally do not pay more because you used an affiliate link.
        However, the retailer controls the final price, tax, shipping, duties,
        discounts, availability, and purchase terms.
      </p>

      <h2>2. How affiliate relationships affect recommendations</h2>
      <p>
        Affiliate eligibility does not guarantee that a product will be
        recommended, and commission does not secretly determine ordinary
        recommendation ranking. Lookrdy aims to rank ordinary results primarily
        using factors such as your stated preferences, occasion, budget, general
        location, reported availability, product eligibility, and similarity to
        the recommended Look.
      </p>
      <p>
        Our catalogue is limited to the retailers and product data available to
        Lookrdy. A retailer without an affiliate relationship may be absent even
        if it sells a relevant item, and we do not claim to search or compare
        the entire market.
      </p>

      <h2>3. Sponsored placements and other compensation</h2>
      <p>
        A retailer or brand may separately pay for advertising, sponsored
        placement, promotional content, free or discounted products, data
        access, or another commercial arrangement. Paid placement must be
        clearly labelled as &ldquo;Sponsored,&rdquo; &ldquo;Ad,&rdquo;
        &ldquo;Paid placement,&rdquo; or equivalent and distinguished from
        ordinary recommendations.
      </p>
      <p>
        Receiving compensation does not permit us to make claims we do not
        believe are supported. Any opinion, rationale, or recommendation
        presented as Lookrdy&rsquo;s own should reflect our genuine assessment
        based on the information available at the time.
      </p>

      <h2>4. Product information and retailer responsibility</h2>
      <p>
        Lookrdy does not manufacture, own, stock, sell, ship, warrant, or accept
        returns for third-party products. Product names, images, trademarks,
        descriptions, prices, size information, stock, and promotions come from
        retailers, affiliate networks, product feeds, or other authorized
        sources and may change or contain errors.
      </p>
      <p>
        Always verify the product, size chart, material, colour, final price,
        shipping, and return terms on the retailer&rsquo;s website. Purchases
        are made from the retailer, not Lookrdy. The retailer is responsible for
        checkout, payment, fulfilment, product quality, customer service,
        refunds, and returns.
      </p>

      <h2>5. Generated Looks and product similarity</h2>
      <p>
        A generated Look is a style visualization, not a photograph or guarantee
        of the linked products. A linked item may differ in cut, material,
        colour, texture, detail, proportion, fit, or availability. Lookrdy may
        display similarity information or a rationale to help you evaluate the
        difference, but you are responsible for reviewing the retailer&rsquo;s
        current listing before purchase.
      </p>

      <h2>6. Tracking and privacy</h2>
      <p>
        Affiliate links may contain referral identifiers. Retailers and
        affiliate networks may use cookies, pixels, server-to-server events, or
        similar technologies to record clicks, attribute purchases, prevent
        fraud, and calculate commissions. Lookrdy may receive confirmation that
        a transaction occurred, the order value or product category, commission
        status, and related identifiers, but the exact information varies by
        partner.
      </p>
      <p>
        For more information about our handling of personal information and
        cookies, see our <Link href="/legal/privacy">Privacy Policy</Link>.
        Retailers and affiliate networks process information under their own
        privacy policies.
      </p>

      <h2>7. Returns, cancellations, and commission reversals</h2>
      <p>
        If you cancel or return a retailer purchase, the retailer or affiliate
        network may reverse or reduce the commission paid to Lookrdy. Your right
        to return a product is determined by the retailer&rsquo;s policy and
        applicable law, not by whether Lookrdy receives a commission.
      </p>

      <h2>8. Disclosure placement</h2>
      <p>
        We aim to place a short disclosure close to product recommendations or
        affiliate links, not only on this page. Examples include &ldquo;Affiliate
        link &mdash; Lookrdy may earn a commission&rdquo; or &ldquo;We may earn a
        commission if you buy through this link, at no extra cost to you.&rdquo;
        Social content will use a clear label such as &ldquo;Ad,&rdquo;
        &ldquo;Affiliate link,&rdquo; or another disclosure appropriate to the
        platform and applicable law.
      </p>

      <h2>9. Changes and contact</h2>
      <p>
        Affiliate relationships may begin, change, or end over time. We may
        update this Disclosure accordingly and will post the revised date above.
      </p>
      <p>
        Questions about a recommendation or affiliate relationship may be sent
        to <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>.
      </p>

      <PolicyMeta current="affiliate" />
    </PageShell>
  );
}
