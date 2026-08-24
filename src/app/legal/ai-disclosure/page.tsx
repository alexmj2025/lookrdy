import type { Metadata } from "next";
import "../../landing.css";
import { PageShell } from "@/components/landing/PageShell";
import { PolicyMeta } from "@/components/landing/PolicyMeta";

export const metadata: Metadata = {
  title: "AI Disclosure — Lookrdy",
  description:
    "What Lookrdy's automated systems do, their limits, and your choices.",
};

export default function AiDisclosurePage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="AI Disclosure"
      intro="Lookrdy uses artificial intelligence and automated systems to help create personal-style directions, visualizations, explanations, product matches, and rankings. This disclosure explains what those systems do, their limits, and your choices."
      updated="Effective date: August 23, 2026 · Last updated: August 23, 2026"
    >
      <h2>1. Where Lookrdy uses AI</h2>
      <p>
        Lookrdy may use AI to interpret your occasion, desired impression, total
        budget, general location, size and style preferences, feedback, optional
        photo, and text prompts; generate three outfit directions and
        visualizations; find similar retailer products; explain trade-offs;
        allocate a budget; detect prohibited content; and improve reliability.
      </p>
      <p>
        Some supporting decisions, such as product filtering, availability
        checks, fraud controls, and ranking, may combine automated rules with
        AI-generated scores. Lookrdy may also use authorized human review for
        support, safety, incident response, or quality investigation.
      </p>

      <h2>2. Optional photos and personal information</h2>
      <p>
        Uploading a personal photo is optional. If you upload one, Lookrdy
        processes it with your prompt and style information to provide the
        result you requested. Authorized service providers may receive the
        minimum information needed to perform generation, analysis, safety
        review, storage, or delivery for Lookrdy.
      </p>
      <p>
        Lookrdy does not use uploaded photos to train its own or third-party AI
        models by default. Any future model-improvement use of personal photos
        will require separate, affirmative opt-in consent. Refusing that
        optional consent will not prevent use of the core Service.
      </p>
      <p>
        Lookrdy does not use uploaded photos for facial recognition, identity
        authentication, or creation of biometric identifiers intended to
        uniquely identify a person. We do not design the Service to infer
        sensitive traits such as health, ethnicity, religion, sexual
        orientation, or precise body measurements from a photo.
      </p>

      <h2>3. Generated-image limitations</h2>
      <p>
        AI-generated images are style visualizations, not photographs,
        measurements, or virtual fitting guarantees. They may inaccurately alter
        facial features, skin tone, hair, body proportions, posture, colour,
        fabric, garment details, accessories, lighting, or surroundings.
      </p>
      <p>
        A visualization does not guarantee how an item will look or fit in real
        life and does not guarantee an exact match to any linked product. Do not
        use a generated image for identity verification, medical or body
        assessment, professional evidence, or a decision that could materially
        affect another person.
      </p>

      <h2>4. Recommendations and product matching</h2>
      <p>
        AI recommendations are probabilistic and may be incomplete, repetitive,
        biased, unsuitable, or wrong. Ordinary results are intended to
        prioritize relevance to your stated occasion, preferences, budget,
        general location, reported availability, product eligibility, and
        similarity. Affiliate commission does not secretly determine ordinary
        ranking. Any paid placement must be clearly labelled.
      </p>
      <p>
        Lookrdy searches a limited set of retailers and data sources. Product
        information may be stale or incorrect, and a similar product may differ
        in cut, material, colour, texture, detail, proportion, fit, or
        availability. Always verify the current retailer listing, size chart,
        final price, shipping, and returns before buying.
      </p>

      <h2>5. Human judgment and your responsibility</h2>
      <p>
        Lookrdy is a styling and shopping-assistance tool, not a human stylist,
        tailor, medical professional, employment adviser, or financial adviser.
        You remain responsible for evaluating outputs, checking retailer
        information, deciding what to wear or buy, and using reasonable judgment
        for cultural, workplace, safety, weather, and dress-code requirements.
      </p>
      <p>
        Do not upload another person&rsquo;s image without authority. Do not use
        Lookrdy for surveillance, facial recognition, identity verification,
        impersonation, deceptive deepfakes, harassment, discrimination,
        exploitation, or decisions about employment, credit, housing, insurance,
        education, healthcare, or legal rights.
      </p>

      <h2>6. Reporting, deletion, and questions</h2>
      <p>
        You may report an unsafe, offensive, inaccurate, or rights-infringing
        output to{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>.
        Depending on where you live and subject to legal exceptions, you may
        request access, correction, export, or deletion of personal information,
        uploaded photos, generated images, saved wardrobe assets, profile data,
        or your account.
      </p>
      <p>
        We may update this disclosure when our models, providers, safeguards, or
        features change. The revised date will appear above and additional
        notice will be provided where required.
      </p>
      <ul>
        <li>
          <strong>Contact:</strong>{" "}
          <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>
        </li>
        <li>
          <strong>Business address:</strong> Lookrdy will publish its business
          address before accepting paid orders.
        </li>
      </ul>

      <PolicyMeta current="ai" />
    </PageShell>
  );
}
