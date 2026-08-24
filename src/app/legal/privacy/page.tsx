import type { Metadata } from "next";
import Link from "next/link";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";
import { PolicyMeta } from "@/components/landing/PolicyMeta";

export const metadata: Metadata = {
  title: "Privacy Policy — Lookrdy",
  description:
    "How Lookrdy collects, uses, discloses, retains, and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      updated="Effective date: August 23, 2026 · Last updated: August 23, 2026"
    >
      <h2>1. Scope and who we are</h2>
      <p>
        This Privacy Policy explains how Lookrdy, doing business as lookrdy
        (&ldquo;Lookrdy,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;), collects, uses, discloses, retains, and protects
        personal information when you visit{" "}
        <a href="https://lookrdy.com">https://lookrdy.com</a>, create an
        account, use our website or applications, purchase a Style Plan or
        credits, upload content, receive AI-assisted style recommendations,
        follow retailer links, contact us, or otherwise interact with our
        services (collectively, the &ldquo;Service&rdquo;).
      </p>
      <p>
        <strong>Controller and contact.</strong> Lookrdy is responsible for the
        personal information described in this Policy unless another notice
        states otherwise. The business address will be published before Lookrdy
        accepts paid orders. Questions and privacy requests may be sent to{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>.
      </p>
      <p>
        This Policy applies to the Service and our own communications. It does
        not govern third-party retailers, payment processors, social networks,
        affiliate networks, or other services that publish their own privacy
        notices.
      </p>

      <h2>2. Plain-language summary</h2>
      <ul>
        <li>
          Photo upload is optional. If you upload a photo, we use it to provide
          the styling or visualization you request.
        </li>
        <li>
          We do not use your uploaded photos to train AI models by default. We
          would request separate affirmative consent before any future
          model-improvement use.
        </li>
        <li>
          We collect account details, styling inputs, optional uploads, usage
          data, purchase records, communications, and affiliate-link activity
          needed to operate and improve the Service.
        </li>
        <li>
          We use service providers for functions such as hosting,
          authentication, AI processing, payments, analytics, communications,
          and support. We require service providers to process information for
          the purposes we specify and subject to appropriate safeguards.
        </li>
        <li>
          We do not sell personal information for money. If our practices ever
          constitute &ldquo;sale,&rdquo; &ldquo;sharing,&rdquo; or targeted
          advertising under applicable law, we will provide the required notice
          and opt-out controls.
        </li>
        <li>
          You may request access, correction, export, or deletion, subject to
          identity verification and legal exceptions.
        </li>
      </ul>

      <h2>3. Personal information we collect</h2>

      <h3>3.1 Information you provide</h3>
      <p>
        <strong>Account and contact information.</strong> Name, email address,
        login credentials or authentication identifiers, account preferences,
        country or region, and any information needed to create or secure your
        account.
      </p>
      <p>
        <strong>Style profile and intake information.</strong> Occasion, desired
        impression, budget, general location or market, clothing sizes, style
        preferences, colours or items to avoid, feedback, selections,
        rejections, saved Looks, owned-item information you choose to provide,
        and similar styling context.
      </p>
      <p>
        <strong>Photos and other user content.</strong> Optional personal
        photos, inspiration images, wardrobe images, text prompts, notes, and
        other material you submit. Photos may contain information about your
        appearance and surroundings. Do not upload content you are not
        authorized to use.
      </p>
      <p>
        <strong>Transactions.</strong> The Style Plan or credits purchased,
        amount, currency, tax and invoice details, transaction identifiers,
        refund status, and limited payment metadata supplied by our payment
        processor. We do not intend to store full payment-card numbers or card
        security codes.
      </p>
      <p>
        <strong>Communications.</strong> Support requests, survey responses,
        feedback, complaints, marketing preferences, and any other information
        you send to us.
      </p>

      <h3>3.2 Information collected automatically</h3>
      <p>
        <strong>Device and usage data.</strong> IP address, browser and device
        type, operating system, language, approximate region derived from IP,
        referring and exit pages, pages or features used, timestamps, session
        identifiers, crash logs, performance information, security events, and
        interactions with recommendations.
      </p>
      <p>
        <strong>Cookies and similar technologies.</strong> Cookies, local
        storage, SDKs, pixels, and similar technologies may support sign-in,
        security, preferences, analytics, attribution, and affiliate tracking.
        Section 8 explains these technologies and your choices.
      </p>
      <p>
        <strong>Retailer and affiliate activity.</strong> When you select a
        retailer link, we may record the product or Look, retailer, timestamp,
        referral or campaign identifier, click event, and conversion or
        commission status reported by the retailer or affiliate network.
        Retailers and networks may separately collect information under their
        own policies.
      </p>

      <h3>3.3 Information created or inferred</h3>
      <p>
        We may create style preferences, similarity scores, recommendation
        rationales, budget allocations, product rankings, and other inferences
        from the information you provide and your use of the Service. These
        inferences are used to personalize and improve recommendations. We do
        not design the Service to identify you biometrically or to infer
        sensitive traits such as health, ethnicity, religion, sexual
        orientation, or precise body measurements from your photos.
      </p>

      <h3>3.4 Information from other sources</h3>
      <p>
        We may receive account information from authentication providers;
        transaction status from payment processors; product, price, stock, size,
        and commission data from retailers and affiliate networks; and
        analytics, fraud-prevention, or marketing-attribution information from
        service providers. We combine this information only for the purposes
        described in this Policy.
      </p>

      <h2>4. How and why we use personal information</h2>
      <ul>
        <li>
          Provide, personalize, and operate the Service, including account
          creation, intake, three-Look generation, saved Looks, and retailer
          product matching.
        </li>
        <li>
          Process optional photos and prompts to create style visualizations and
          recommendations requested by you.
        </li>
        <li>
          Apply your occasion, preferences, location, size information,
          availability, and total budget to product selection and outfit
          composition.
        </li>
        <li>
          Process payments, issue receipts, administer credits, deliver
          purchased digital services, and handle refunds or charge disputes.
        </li>
        <li>
          Maintain product quality, measure whether recommendations are useful,
          diagnose errors, and improve non-photo product logic and user
          experience.
        </li>
        <li>
          Protect accounts and the Service; detect fraud, abuse, security
          incidents, prohibited content, and violations of our Terms.
        </li>
        <li>
          Provide customer support, respond to privacy requests, and communicate
          service or policy changes.
        </li>
        <li>
          Send marketing only where permitted and in accordance with your
          choices; marketing consent is not required to use the core Service.
        </li>
        <li>
          Measure retailer clicks, affiliate attribution, and commissions and
          comply with affiliate-program obligations.
        </li>
        <li>
          Comply with law, enforce agreements, establish or defend legal claims,
          and protect users, Lookrdy, and others.
        </li>
      </ul>

      <h2>5. Legal bases where required</h2>
      <p>
        Where a law requires us to identify a legal basis, we rely on one or
        more of the following: performance of a contract to provide the Service
        you request; your consent, including for optional photo processing,
        optional cookies, or marketing where required; our legitimate interests
        in operating, securing, measuring, and improving the Service, balanced
        against your rights; and compliance with legal obligations. You may
        withdraw consent at any time, but withdrawal does not affect processing
        already lawfully completed and may prevent us from providing features
        that require the relevant information.
      </p>

      <h2>6. Photos, AI processing, and generated outputs</h2>
      <p>
        <strong>Optional upload.</strong> You can use any photo-optional
        experience we make available without submitting a personal photo. If you
        choose to upload a photo, we will explain the relevant purpose before
        upload.
      </p>
      <p>
        <strong>Purpose limitation.</strong> We process your photo, prompt,
        style profile, and eligible product information to provide the requested
        styling analysis, visualization, product matching, safety review,
        troubleshooting, and delivery of your result.
      </p>
      <p>
        <strong>No training by default.</strong> We do not use your uploaded
        photos to train our or third-party AI models by default. If we introduce
        an optional model-improvement program, participation will require
        separate, affirmative opt-in consent, and refusing will not prevent use
        of the core Service.
      </p>
      <p>
        <strong>Service providers.</strong> We may send the minimum information
        needed to third-party AI, image-processing, hosting, storage, security,
        and related infrastructure providers selected for the production
        Service. They may process information in Canada, Japan, and other
        countries where they operate, under contractual and security
        restrictions. We will identify providers where applicable law requires
        it.
      </p>
      <p>
        <strong>Not biometric identification.</strong> Lookrdy does not use
        uploaded photos to authenticate identity through facial recognition or
        create biometric identifiers for uniquely identifying a person. If this
        changes, we will provide a separate notice and obtain any consent
        required by law.
      </p>
      <p>
        <strong>Output limitations.</strong> Generated images and
        recommendations may alter or inaccurately represent facial features,
        body proportions, colours, fabrics, garment details, styling, or
        surroundings. They are style visualizations, not measurements, sizing
        tools, medical assessments, identity verification, or guarantees of
        real-world fit.
      </p>
      <p>
        <strong>Human access.</strong> Authorized personnel may access content
        only where reasonably necessary for support, safety, abuse prevention,
        incident response, or quality investigation, and subject to role-based
        access and confidentiality controls.
      </p>

      <h2>7. When we disclose personal information</h2>
      <ul>
        <li>
          <strong>Service providers and processors</strong> that support
          hosting, private file storage, databases, authentication, AI
          processing, payments, analytics, error monitoring, communications,
          customer support, fraud prevention, and security.
        </li>
        <li>
          <strong>Retailers and affiliate networks</strong> when you follow a
          retailer link or when attribution is needed to confirm a referred
          purchase or commission. We do not send your uploaded photo to a
          retailer merely because you click a product link unless we clearly
          tell you and obtain any required permission.
        </li>
        <li>
          <strong>Professional advisers</strong> such as lawyers, accountants,
          insurers, auditors, and security specialists where reasonably
          necessary and subject to duties of confidentiality.
        </li>
        <li>
          <strong>Authorities or other parties</strong> where disclosure is
          required by law, legal process, or a valid government request, or is
          reasonably necessary to protect rights, safety, security, and the
          integrity of the Service.
        </li>
        <li>
          <strong>A buyer, investor, lender, or successor</strong> in connection
          with a proposed or completed merger, financing, acquisition,
          restructuring, insolvency, or sale of assets, subject to appropriate
          confidentiality and lawful-use restrictions.
        </li>
        <li>Other parties at your direction or with your consent.</li>
      </ul>

      <h2>8. Cookies and similar technologies</h2>
      <p>We may use the following categories of technologies:</p>
      <ul>
        <li>
          <strong>Strictly necessary:</strong> account login, session
          continuity, security, fraud prevention, payment flow, network
          management, and storing privacy choices.
        </li>
        <li>
          <strong>Preferences:</strong> language, region, saved interface
          settings, and user-selected display choices.
        </li>
        <li>
          <strong>Analytics and performance:</strong> understanding visits,
          feature use, errors, speed, and aggregated conversion funnels.
        </li>
        <li>
          <strong>Affiliate and attribution:</strong> recording that a user
          arrived from or clicked to a retailer, associating a qualifying
          transaction with Lookrdy, and preventing referral fraud.
        </li>
        <li>
          <strong>Advertising or targeting:</strong> only if later introduced
          and only with any notice, consent, and opt-out required by applicable
          law.
        </li>
      </ul>
      <p>
        Where consent is required, optional technologies will remain disabled
        until you choose to allow them. You can change your selection through
        the cookie settings control available on the website. Blocking some
        technologies may affect non-essential personalization or attribution but
        should not prevent basic access to the website. Browser controls may
        also allow you to delete or block cookies. Where legally required and
        technically supported, we will process recognized opt-out preference
        signals such as Global Privacy Control.
      </p>

      <h2>9. Affiliate links and tracking</h2>
      <p>
        Some retailer links are affiliate links. If you click one, the retailer
        or affiliate network may use cookies, referral identifiers, pixels,
        server-to-server events, or similar methods to attribute a purchase to
        Lookrdy. This may allow us to receive a commission without increasing
        the price you pay. Affiliate tracking is described in our{" "}
        <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>.
        Each retailer and network controls its own processing and privacy
        practices.
      </p>

      <h2>10. International processing and transfers</h2>
      <p>
        Lookrdy and its service providers may process personal information
        outside your province, state, or country, including in Canada, Japan,
        and other countries where our service providers operate. Those locations
        may have different privacy laws, and information may be accessible to
        courts, law-enforcement bodies, or regulators under local law. Where
        required, we use contractual, organizational, and technical measures
        intended to provide an appropriate level of protection, such as
        data-processing agreements, transfer clauses, access restrictions, and
        encryption. Contact us for more information about applicable safeguards.
      </p>

      <h2>11. Retention and deletion</h2>
      <p>
        We keep personal information only for as long as reasonably necessary to
        provide and secure the Service, complete requested generations, maintain
        user-selected saved content, process transactions, resolve disputes,
        prevent fraud, enforce agreements, and meet legal, tax, accounting, and
        affiliate-program obligations. Active account and saved-style data are
        generally retained while the account remains open. Processing copies are
        deleted or de-identified when no longer needed for the requested
        operation. Transaction, consent, security, and legal records may be
        retained longer where required or reasonably necessary. Backups are
        removed through the ordinary backup cycle and are not returned to active
        use except for recovery or legal necessity.
      </p>
      <p>
        Deletion requests may not remove information that we must retain for
        legal, fraud-prevention, security, chargeback, tax, or recordkeeping
        purposes. Deleted information may remain in protected backups until the
        applicable backup cycle completes, but it will not be restored to active
        use except for disaster recovery or legal necessity.
      </p>

      <h2>12. Security</h2>
      <p>
        We use administrative, technical, and physical safeguards designed for
        the sensitivity of the information we handle. Intended controls include
        private storage, encryption in transit and at rest where appropriate,
        signed or time-limited file access, short-lived processing copies,
        role-based access, authentication controls, logging, vendor review, and
        incident-response procedures. No system is completely secure, and we
        cannot guarantee that unauthorized access, loss, misuse, or disclosure
        will never occur. If an incident creates notification duties, we will
        notify affected individuals and regulators as required by law.
      </p>

      <h2>13. Your choices and privacy rights</h2>
      <p>Depending on where you live, you may have rights to:</p>
      <ul>
        <li>know whether and how we process your personal information;</li>
        <li>
          access or receive a copy of personal information we hold about you;
        </li>
        <li>correct inaccurate or incomplete information;</li>
        <li>
          delete personal information, photos, generated images, saved wardrobe
          assets, profile data, or your account;
        </li>
        <li>
          withdraw consent, object to or restrict certain processing, or request
          portability where applicable;
        </li>
        <li>
          opt out of marketing communications, targeted advertising, sale, or
          sharing where those rights apply;
        </li>
        <li>appeal a refusal where applicable; and</li>
        <li>
          complain to the relevant privacy or data-protection authority.
        </li>
      </ul>
      <p>
        <strong>How to submit a request.</strong> Use the privacy controls
        available in your Lookrdy account or email{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>. We may
        verify your identity before completing a request and may ask an
        authorized agent to provide proof of authority. We will respond within
        the period required by applicable law. We will not discriminate against
        you for exercising a privacy right.
      </p>
      <p>
        <strong>Canada.</strong> You may challenge our compliance through{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a> and,
        where applicable, contact the Office of the Privacy Commissioner of
        Canada or the relevant provincial privacy regulator after giving us an
        opportunity to address the concern.
      </p>
      <p>
        <strong>Japan.</strong> Where the Act on the Protection of Personal
        Information applies, you may request disclosure, correction, cessation
        of use, or deletion as provided by law and may contact Japan&rsquo;s
        Personal Information Protection Commission regarding unresolved
        concerns.
      </p>
      <p>
        <strong>EEA/UK and other regions.</strong> If applicable, you may have
        additional rights concerning legal basis, objection, restriction,
        portability, automated decision-making, and complaints to your local
        supervisory authority. Lookrdy does not intend to make solely automated
        decisions that produce legal or similarly significant effects about
        users.
      </p>

      <h2>14. Marketing communications</h2>
      <p>
        We send promotional email or messages only where permitted. Where
        required, we will obtain consent, identify the sender, provide contact
        information, and include a working unsubscribe method. You may
        unsubscribe through the message or account settings. We may still send
        non-promotional communications such as receipts, security alerts,
        service notices, and responses to your requests.
      </p>

      <h2>15. Adults only</h2>
      <p>
        The Service is intended only for adults aged 18 or older. We do not
        knowingly collect personal information from children. Do not upload a
        child&rsquo;s photo or create an account for a child. If you believe a
        person under 18 has provided personal information, contact{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a> so we
        can investigate and delete it where appropriate.
      </p>

      <h2>16. Third-party services and retailer links</h2>
      <p>
        The Service may link to retailers, affiliate networks, authentication
        providers, payment processors, social platforms, and other third
        parties. Their privacy, security, pricing, availability, delivery,
        return, and customer-service practices are governed by their own terms
        and policies. Review those policies before providing information or
        purchasing.
      </p>

      <h2>17. Changes to this Policy</h2>
      <p>
        We may update this Policy to reflect changes in the Service, technology,
        vendors, law, or business operations. We will post the revised version
        with a new &ldquo;Last updated&rdquo; date and provide additional notice
        or obtain consent where required. Material changes will not be applied
        retroactively where prohibited by law.
      </p>

      <h2>18. Contact and complaints</h2>
      <ul>
        <li>
          <strong>Privacy contact:</strong> Lookrdy Privacy Team
        </li>
        <li>
          <strong>Legal entity:</strong> Lookrdy
        </li>
        <li>
          <strong>Business address:</strong> Lookrdy will publish its business
          address before accepting paid orders.
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>
        </li>
        <li>
          <strong>Website:</strong>{" "}
          <a href="https://lookrdy.com">https://lookrdy.com</a>
        </li>
      </ul>
      <p>
        Please describe your concern and the account or feature involved. We may
        request information reasonably necessary to verify identity and
        investigate the issue.
      </p>

      <PolicyMeta current="privacy" />
    </PageShell>
  );
}
