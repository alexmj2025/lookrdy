import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CookieSettingsLink } from "@/components/consent/CookieSettingsLink";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#looks", label: "Looks" },
      { href: "/photo", label: "Start a session" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/cookie", label: "Cookie Policy" },
      { href: "/legal/ai-disclosure", label: "AI Disclosure" },
      { href: "/legal/affiliate-disclosure", label: "Affiliate Disclosure" },
    ],
  },
];

const SOCIAL = [
  {
    label: "Instagram",
    href: "#",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm5.6-1.1h.01",
  },
  {
    label: "Pinterest",
    href: "#",
    path: "M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 2 0 3.4-2.5 3.4-5.5 0-2.3-1.5-4-4.3-4a4.9 4.9 0 0 0-5.1 4.9c0 1 .3 1.6.7 2.1.2.2.2.3.1.6l-.2.8c-.1.3-.3.4-.6.2-1.4-.6-2-2.2-2-4 0-3 2.5-6.6 7.5-6.6 4 0 6.7 2.9 6.7 6 0 4.1-2.3 7.2-5.7 7.2-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.2.9-.8 1.9-1.2 2.6A10 10 0 1 0 12 2Z",
  },
  {
    label: "TikTok",
    href: "#",
    path: "M16 3c.4 2.3 1.9 3.9 4 4.2v3c-1.6.1-3-.4-4.3-1.3v6.2a6 6 0 1 1-5.2-6v3.1a2.9 2.9 0 1 0 2.1 2.8V3H16Z",
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="lnd-foot">
      <div className="lnd-container">
        <div className="lnd-foot__grid">
          <div className="lnd-foot__brand">
            <Logo height={26} className="lnd-foot__mark" />
            <p className="lnd-body">
              Your personal stylist. One photo in, three complete looks out
              &mdash; built from products you can actually buy.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div className="lnd-foot__col" key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href}>{link.label}</Link>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
                {col.title === "Legal" && (
                  <li>
                    <CookieSettingsLink />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="lnd-foot__bar">
          <p className="lnd-fine">
            &copy; {year} Lookrdy. Images are AI visualizations &mdash; fit is
            not guaranteed, and price and stock are confirmed on the
            retailer&rsquo;s site.
          </p>
          <div className="lnd-foot__social">
            {SOCIAL.map((item) => (
              <a key={item.label} href={item.href} aria-label={item.label}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={item.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
