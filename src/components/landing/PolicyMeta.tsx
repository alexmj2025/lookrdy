import Link from "next/link";

export const POLICIES = [
  { slug: "terms", href: "/legal/terms", label: "Terms of Service" },
  { slug: "privacy", href: "/legal/privacy", label: "Privacy Policy" },
  { slug: "cookie", href: "/legal/cookie", label: "Cookie Policy" },
  { slug: "ai", href: "/legal/ai-disclosure", label: "AI Disclosure" },
  {
    slug: "affiliate",
    href: "/legal/affiliate-disclosure",
    label: "Affiliate Disclosure",
  },
] as const;

export type PolicySlug = (typeof POLICIES)[number]["slug"];

/**
 * The entity block and cross-policy links that close every legal document.
 * The source documents print absolute lookrdy.com URLs for these; rendering
 * them as internal links keeps navigation client-side and means the set can
 * only ever point at routes that exist.
 */
export function PolicyMeta({ current }: { current: PolicySlug }) {
  return (
    <>
      <h2>Entity and contact information</h2>
      <ul>
        <li>
          <strong>Legal entity:</strong> Lookrdy
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:marketing@lookrdy.com">marketing@lookrdy.com</a>
        </li>
        <li>
          <strong>Website:</strong>{" "}
          <a href="https://lookrdy.com">https://lookrdy.com</a>
        </li>
        <li>
          <strong>Business address:</strong> Lookrdy will publish its business
          address before accepting paid orders.
        </li>
      </ul>

      <h2>Related policies</h2>
      <ul>
        {POLICIES.filter((p) => p.slug !== current).map((p) => (
          <li key={p.slug}>
            <Link href={p.href}>{p.label}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
