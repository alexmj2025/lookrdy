import type { Metadata } from "next";
import Link from "next/link";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";
import { PolicyMeta } from "@/components/landing/PolicyMeta";

export const metadata: Metadata = {
  title: "Terms of Service — Lookrdy",
  description:
    "The binding agreement between you and Lookrdy governing use of the Service.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      updated="Effective date: August 23, 2026 · Last updated: August 23, 2026"
    >
      <h2>1. Agreement to these Terms</h2>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) are a binding agreement
        between you and Lookrdy, doing business as lookrdy
        (&ldquo;Lookrdy,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;). They govern your access to and use of{" "}
        <a href="https://lookrdy.com">https://lookrdy.com</a>, our websites and
        applications, AI-assisted styling features, Style Plans, credits,
        generated Looks, product recommendations, and related services
        (collectively, the &ldquo;Service&rdquo;).
      </p>
      <p>
        By creating an account, clicking to accept, purchasing, or using the
        Service, you agree to these Terms and acknowledge our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>. If
        you do not agree, do not use the Service.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and legally capable of entering a
        contract where you live. By using the Service, you represent that you
        meet these requirements. The Service is not directed to children, and
        you may not upload images of anyone under 18.
      </p>
      <p>
        If you use the Service for an organization, you represent that you have
        authority to bind that organization, and &ldquo;you&rdquo; includes both
        you and the organization.
      </p>

      <h2>3. The Service</h2>
      <p>
        Lookrdy is an AI-assisted personal styling and shopping-decision
        service. Depending on the features available, you may provide an
        occasion, desired impression, budget, general location, size
        information, preferences, exclusions, optional personal photo, and other
        context. The Service may produce three outfit directions, style
        visualizations, explanations, total-price estimates, and links to
        similar products offered by third-party retailers.
      </p>
      <p>
        Lookrdy is not a retailer, clothing manufacturer, tailor, medical or
        body-assessment service, fiduciary, licensed professional stylist, or
        guarantor of any product. We do not own retailer inventory and, in the
        MVP, do not complete retailer checkout, fulfil orders, deliver products,
        or administer retailer returns.
      </p>

      <h2>4. Accounts and security</h2>
      <ul>
        <li>Provide accurate, current information and keep it updated.</li>
        <li>
          Keep credentials confidential and do not share or sell your account.
        </li>
        <li>
          Notify{" "}
          <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>{" "}
          promptly if you suspect unauthorized access.
        </li>
        <li>
          You are responsible for activity under your account to the extent
          permitted by law.
        </li>
        <li>
          We may require verification, limit access, or suspend an account to
          protect users or the Service.
        </li>
      </ul>

      <h2>5. User inputs, photos, and permissions</h2>
      <p>
        <strong>Your content.</strong> You retain ownership of photos, prompts,
        wardrobe images, inspiration images, feedback, and other material you
        submit (&ldquo;User Content&rdquo;). You grant Lookrdy a limited,
        worldwide, non-exclusive, royalty-free licence to host, copy, process,
        modify, transmit, and display User Content only as reasonably necessary
        to provide, secure, support, and improve the Service in accordance with
        these Terms and our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>. This licence ends
        when the content is deleted, except for lawful retention, protected
        backups, or content already de-identified or aggregated so it no longer
        identifies you.
      </p>
      <p>
        <strong>Your responsibility.</strong> You represent that you own or have
        all permissions needed for User Content and that our permitted
        processing will not infringe privacy, publicity, copyright, trademark,
        confidentiality, or other rights. Upload only your own photo or an
        adult&rsquo;s photo where you have explicit permission.
      </p>
      <p>
        <strong>Photo restrictions.</strong> Do not upload images of minors,
        intimate or sexual images, illegal content, identity documents, payment
        cards, medical records, highly sensitive documents, content intended for
        facial recognition or impersonation, or content that exploits, harasses,
        threatens, or violates another person&rsquo;s rights.
      </p>
      <p>
        <strong>AI training.</strong> Uploaded personal photos are not used to
        train AI models by default. Any future model-improvement use requires
        separate affirmative opt-in consent as described in the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>6. AI outputs and styling limitations</h2>
      <p>
        AI-assisted outputs may be inaccurate, incomplete, inconsistent,
        unavailable, or unsuitable. Review every recommendation independently
        before relying on it or purchasing. Similar prompts may produce similar
        outputs for different users, and an output may not be unique.
      </p>
      <p>
        <strong>Style visualization, not fit guarantee.</strong> A generated
        image illustrates a possible style direction. It does not guarantee
        garment size, fit, comfort, material, construction, colour, drape, body
        proportion, appearance, identity accuracy, or how a product will look in
        person. Any size guidance is separate, informational, and should be
        checked against the retailer&rsquo;s current size chart and return
        policy.
      </p>
      <p>
        <strong>Product similarity.</strong> A linked product may differ from
        the generated concept in cut, colour, material, texture, detailing,
        branding, proportion, size availability, or other characteristics.
        Similarity labels and explanations are estimates, not warranties of
        equivalence.
      </p>
      <p>
        <strong>No high-stakes use.</strong> Do not rely on the Service for
        safety-critical uniforms, protective equipment, medical needs, legal
        dress requirements, religious compliance, employment guarantees, or any
        circumstance where an incorrect recommendation could cause material harm
        without independent verification.
      </p>

      <h2>7. Product recommendations and ranking</h2>
      <p>
        Lookrdy aims to rank ordinary recommendations primarily using factors
        such as your stated preferences, occasion, budget, general location,
        product similarity, size or category eligibility, and reported
        availability. Affiliate commission does not secretly determine organic
        recommendation ranking.
      </p>
      <p>
        <strong>Sponsored content.</strong> A brand or retailer may pay for
        separate placement or promotion. Any such placement must be clearly
        labelled as &ldquo;Sponsored,&rdquo; &ldquo;Ad,&rdquo; or equivalent and
        distinguished from ordinary recommendations. The existence of an
        affiliate relationship is disclosed under our{" "}
        <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>.
      </p>
      <p>
        <strong>Coverage is limited.</strong> Recommendations reflect only the
        retailers, product feeds, catalogues, and data sources available to
        Lookrdy at the time. They do not represent every product or the entire
        market, and omission does not mean a product is unsuitable.
      </p>

      <h2>8. Retailer information, prices, and availability</h2>
      <p>
        Retailer data may be delayed, incomplete, incorrect, or changed without
        notice. Prices, taxes, discounts, currencies, sizes, stock, shipping,
        duties, delivery dates, return eligibility, and product descriptions
        must be confirmed on the retailer&rsquo;s website before purchase. The
        retailer&rsquo;s information at checkout controls if it differs from
        Lookrdy.
      </p>
      <p>
        A product shown as available may sell out, be unavailable in your size
        or region, or be replaced before you click or purchase. A total outfit
        price is an estimate based on then-available data and may exclude tax,
        shipping, customs, alterations, membership pricing, or other charges
        unless expressly stated.
      </p>

      <h2>9. Third-party retailers and purchases</h2>
      <p>
        When you follow a retailer link, you leave the Lookrdy Service. Any
        purchase is solely between you and the retailer and is governed by the
        retailer&rsquo;s terms, privacy policy, payment, delivery, warranty,
        exchange, and return rules. Lookrdy is not the seller or merchant of
        record and is not responsible for retailer products, charges,
        fulfilment, authenticity, safety, quality, sizing, customer service,
        refunds, returns, or disputes.
      </p>
      <p>
        Contact the retailer directly regarding an order. We may assist by
        identifying the relevant link or retailer, but we do not control the
        retailer and cannot require a refund, exchange, delivery, or other
        remedy.
      </p>

      <h2>10. Style Plans, credits, payments, and taxes</h2>
      <p>
        <strong>One-time purchase.</strong> Unless the checkout page expressly
        states otherwise, the initial Lookrdy paid offering is a one-time Style
        Plan or credit purchase, not an automatically renewing subscription. The
        checkout page will state the price, currency, applicable taxes, included
        generations or deliverables, and any credit-expiration rule before
        payment.
      </p>
      <p>
        <strong>Payment processor.</strong> Payments are processed by the
        third-party payment processor identified at checkout. You authorize
        Lookrdy and that processor to charge the selected payment method for the
        displayed amount. The processor&rsquo;s terms and privacy policy also
        apply. Lookrdy does not intend to store full payment-card numbers or
        card security codes.
      </p>
      <p>
        <strong>Credits.</strong> Credits, if offered, are personal,
        non-transferable, not legal tender, and have no cash value except where
        required by law. They may be used only for the stated Lookrdy features.
        Any expiry, usage limit, or promotional restriction will be shown before
        purchase or grant.
      </p>
      <p>
        <strong>Taxes and currency.</strong> You are responsible for taxes or
        charges legally imposed on your purchase, except taxes imposed on
        Lookrdy&rsquo;s income. Currency conversion and bank fees may be charged
        by your provider.
      </p>
      <p>
        <strong>Billing errors.</strong> Notify{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>{" "}
        promptly of duplicate, incorrect, or unauthorized Lookrdy charges. This
        does not limit rights you may have through your bank, payment provider,
        or applicable law.
      </p>

      <h2>11. Refunds and failed delivery</h2>
      <p>
        Because a Style Plan is a personalized digital service and generation
        costs begin when processing starts, payments are generally
        non-refundable once generation has begun, except where required by law.
        Before generation begins, you may request cancellation through{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>.
      </p>
      <p>
        If Lookrdy fails to deliver the purchased result because of a verified
        technical failure, we may first provide a replacement generation or
        restore the applicable credit. If we cannot provide the purchased
        service within a reasonable period, we will issue an appropriate refund
        for the undelivered portion. Duplicate charges and confirmed
        unauthorized charges will be corrected. Dissatisfaction with subjective
        style, a retailer&rsquo;s product, fit, price change, stock change,
        shipping, or return decision does not by itself make a completed Style
        Plan refundable, without limiting mandatory consumer rights.
      </p>

      <h2>12. Licence to use the Service and outputs</h2>
      <p>
        Subject to these Terms and payment of applicable fees, Lookrdy grants
        you a limited, personal, revocable, non-exclusive, non-transferable
        licence to access the Service and use generated Looks for your own
        non-commercial styling and shopping decisions.
      </p>
      <p>
        You may save or share your own generated Look for personal purposes, but
        you may not sell, sublicense, use it to train or benchmark a competing
        model at scale, remove notices, falsely claim endorsement, use it to
        impersonate another person, or commercially exploit Lookrdy&rsquo;s
        interface, product database, rankings, or outputs without written
        permission. Third-party products, trademarks, photos, and retailer
        materials remain owned by their respective owners and may be subject to
        separate restrictions.
      </p>

      <h2>13. Lookrdy intellectual property</h2>
      <p>
        The Service, software, design, brand, logos, text, product organization,
        recommendation logic, databases, and other Lookrdy materials are owned
        by or licensed to Lookrdy and are protected by intellectual-property and
        other laws. Except for the limited licence above, no rights are granted
        by implication, estoppel, or otherwise.
      </p>

      <h2>14. Acceptable use</h2>
      <p>You may not:</p>
      <ul>
        <li>violate law or another person&rsquo;s rights;</li>
        <li>
          upload prohibited, deceptive, infringing, abusive, exploitative, or
          unauthorized content;
        </li>
        <li>
          use the Service for facial recognition, surveillance, identity
          verification, impersonation, deepfake abuse, harassment,
          discrimination, or sexual exploitation;
        </li>
        <li>
          scrape, crawl, harvest, copy, or systematically extract retailer data,
          images, outputs, pricing, rankings, or other Service content except as
          expressly allowed;
        </li>
        <li>
          reverse engineer, probe, bypass, disrupt, overload, or compromise the
          Service or its security;
        </li>
        <li>
          use bots or automation to create accounts, consume credits, generate
          traffic, manipulate affiliate attribution, or commit fraud;
        </li>
        <li>circumvent access, regional, payment, or usage restrictions;</li>
        <li>
          resell access or use the Service to build or train a competing product
          without written permission; or
        </li>
        <li>
          misrepresent a relationship with Lookrdy, a retailer, or a featured
          brand.
        </li>
      </ul>

      <h2>15. Feedback</h2>
      <p>
        If you provide suggestions or feedback, you grant Lookrdy a worldwide,
        perpetual, irrevocable, royalty-free right to use it without restriction
        or compensation, provided we do not publicly identify you without
        permission. This does not permit us to use your uploaded personal photos
        for AI training without separate consent.
      </p>

      <h2>16. Suspension and termination</h2>
      <p>
        You may stop using the Service and request account deletion at any time.
        We may limit, suspend, or terminate access if we reasonably believe you
        violated these Terms, created risk or legal exposure, failed to pay,
        abused the Service, infringed rights, manipulated affiliate tracking, or
        threatened security. Where reasonable, we will provide notice and an
        opportunity to address the issue, unless immediate action is needed.
      </p>
      <p>
        After termination, your licence ends. Provisions that by their nature
        should survive will survive, including payment obligations, ownership,
        disclaimers, limitations of liability, indemnity, dispute terms, and
        lawful retention. Account deletion is handled under the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>17. Service changes and availability</h2>
      <p>
        We may add, remove, test, limit, or change features, retailers, models,
        pricing, credit structures, and availability. We do not guarantee
        uninterrupted or error-free operation. If a change materially reduces a
        prepaid, unused entitlement, we will provide a reasonable replacement,
        credit, or refund as required by law.
      </p>

      <h2>18. Disclaimers</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE AND ALL OUTPUTS,
        RECOMMENDATIONS, PRODUCT DATA, AND LINKS ARE PROVIDED &ldquo;AS
        IS&rdquo; AND &ldquo;AS AVAILABLE.&rdquo; LOOKRDY DISCLAIMS ALL EXPRESS,
        IMPLIED, AND STATUTORY WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY,
        AVAILABILITY, AND RESULTS.
      </p>
      <p>
        WE DO NOT WARRANT THAT A LOOK WILL SUIT YOU, THAT A PRODUCT WILL FIT OR
        MATCH THE VISUALIZATION, THAT A RETAILER&rsquo;S INFORMATION IS CURRENT,
        THAT ANY ITEM WILL REMAIN AVAILABLE, OR THAT USE OF THE SERVICE WILL
        PRODUCE A PARTICULAR SOCIAL, PERSONAL, PROFESSIONAL, OR PURCHASE
        OUTCOME. NOTHING IN THESE TERMS EXCLUDES A WARRANTY OR CONSUMER RIGHT
        THAT CANNOT LAWFULLY BE EXCLUDED.
      </p>

      <h2>19. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOOKRDY AND ITS AFFILIATES,
        OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, LICENSORS, AND SERVICE
        PROVIDERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS,
        REVENUE, DATA, GOODWILL, OPPORTUNITY, OR ANTICIPATED SAVINGS, ARISING
        FROM OR RELATED TO THE SERVICE, OUTPUTS, RETAILERS, OR THESE TERMS, EVEN
        IF ADVISED OF THE POSSIBILITY.
      </p>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL AGGREGATE LIABILITY
        ARISING FROM OR RELATED TO THE SERVICE OR THESE TERMS WILL NOT EXCEED
        THE GREATER OF (A) THE AMOUNT YOU PAID TO LOOKRDY FOR THE SERVICE GIVING
        RISE TO THE CLAIM DURING THE 12 MONTHS BEFORE THE EVENT, OR (B) CAD 100
        OR ITS LOCAL-CURRENCY EQUIVALENT.
      </p>
      <p>
        These exclusions and limits do not apply where prohibited, including
        liability that cannot be excluded for fraud, wilful misconduct, gross
        negligence, death or personal injury caused by negligence, or mandatory
        consumer-protection rights.
      </p>

      <h2>20. Indemnity</h2>
      <p>
        To the extent permitted by law, you will defend, indemnify, and hold
        harmless Lookrdy and its affiliates, officers, directors, employees, and
        contractors from third-party claims, damages, losses, liabilities, and
        reasonable costs arising from your unlawful use of the Service, User
        Content, violation of these Terms, or infringement of another
        person&rsquo;s rights. This obligation does not apply to the extent a
        claim results from Lookrdy&rsquo;s own breach, negligence, or
        misconduct.
      </p>

      <h2>21. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws that apply to Lookrdy and to you,
        without limiting any mandatory consumer rights. Any court or tribunal
        with jurisdiction under applicable law may hear a dispute. Before filing
        a claim, you and Lookrdy agree to try in good faith to resolve it by
        written notice to{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>{" "}
        describing the issue and requested resolution. If the matter is not
        resolved within 30 days, either party may use available legal remedies.
        This does not prevent urgent injunctive relief, small-claims
        proceedings, or a consumer complaint process where available.
      </p>

      <h2>22. Changes to these Terms</h2>
      <p>
        We may update these Terms for legal, security, operational, or product
        reasons. We will post the revised Terms with a new date and provide
        additional notice where required. Material changes will apply
        prospectively. If you do not agree, stop using the Service before the
        changes take effect. Continued use after the effective date constitutes
        acceptance to the extent permitted by law.
      </p>

      <h2>23. General terms</h2>
      <p>
        These Terms, the <Link href="/legal/privacy">Privacy Policy</Link>, the{" "}
        <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>,
        and any checkout-specific terms form the entire agreement concerning the
        Service. If a checkout-specific term conflicts with these Terms, the
        checkout-specific term controls only for that purchase. If any provision
        is unenforceable, it will be modified to the minimum extent necessary
        and the remainder will continue. Failure to enforce a provision is not a
        waiver. You may not assign these Terms without our consent; we may
        assign them in connection with a corporate transaction or by operation
        of law. We are not responsible for delay caused by events beyond
        reasonable control. Headings are for convenience only.
      </p>

      <h2>24. Contact</h2>
      <ul>
        <li>
          <strong>Legal entity:</strong> Lookrdy
        </li>
        <li>
          <strong>Business address:</strong> Lookrdy will publish its business
          address before accepting paid orders.
        </li>
        <li>
          <strong>Support:</strong>{" "}
          <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>
        </li>
        <li>
          <strong>Legal notices:</strong>{" "}
          <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>
        </li>
        <li>
          <strong>Website:</strong>{" "}
          <a href="https://lookrdy.com">https://lookrdy.com</a>
        </li>
      </ul>

      <PolicyMeta current="terms" />
    </PageShell>
  );
}
