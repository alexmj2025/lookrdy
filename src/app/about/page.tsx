import type { Metadata } from "next";
import Link from "next/link";
import "../landing.css";
import { PageShell } from "@/components/landing/PageShell";

export const metadata: Metadata = {
  title: "About — Lookrdy",
  description:
    "Why Lookrdy exists: turning “I have nothing to wear” into three complete, buyable outfits.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Getting dressed shouldn’t be the hard part."
      intro="Lookrdy is a personal stylist that works from one photo. Tell it where you’re going, and it comes back with three complete outfit directions built from products you can actually buy."
    >
      <h2>The problem we started with</h2>
      <p>
        Most people don’t have a wardrobe problem. They have a decision problem.
        The clothes exist, the shops exist, the inspiration exists — what’s
        missing is the step in between: knowing what actually works, on you, for
        this particular evening.
      </p>
      <p>
        Style advice online is either too generic to act on (“build a capsule
        wardrobe”) or too specific to reach (a full look on someone with a
        different body, budget and city). Both leave you where you started, in
        front of a wardrobe, running late.
      </p>

      <h2>How Lookrdy approaches it</h2>
      <p>
        We start from a real photo of you and a real occasion, then work
        backwards from what’s purchasable. Every generated look is assembled
        from products that exist, in stock, within the budget you set. If a
        piece isn’t available where you are, it doesn’t make the cut.
      </p>
      <p>
        You get three distinct directions rather than one answer, because taste
        isn’t a solved problem and the point is to give you a real choice. Each
        one comes with a complete shopping list, priced, so the gap between
        “that looks good” and “I own that” is a few taps.
      </p>

      <h2>What we care about</h2>
      <ul>
        <li>
          <strong>Buyable over aspirational.</strong> A look you can’t assemble
          isn’t styling, it’s a mood board.
        </li>
        <li>
          <strong>Your budget is a constraint, not a suggestion.</strong> Set a
          number and the looks respect it.
        </li>
        <li>
          <strong>Retailer matches are examples, not placements.</strong> We
          don’t take payment to put a brand in your results. See our{" "}
          <Link href="/legal/ai-disclosure">AI Disclosure</Link> for how looks are
          generated.
        </li>
        <li>
          <strong>Your photo is yours.</strong> It is used to generate your
          looks and is not sold, published, or used to train models. The detail
          is in our <Link href="/legal/privacy">Privacy Policy</Link>.
        </li>
      </ul>

      <h2>Where we are</h2>
      <p>
        Lookrdy is early. The catalogue is growing, the visualizations are
        improving, and the styling gets better as more people tell us which of
        the three directions they actually wore. If something misses, that
        feedback is the most useful thing you can send us.
      </p>

      <h2>Get in touch</h2>
      <p>
        Questions, press, partnerships or bug reports:{" "}
        <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>.
      </p>
    </PageShell>
  );
}
