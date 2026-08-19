import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

type PageShellProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Rendered under the intro, e.g. "Last updated 18 August 2026". */
  updated?: string;
  children: ReactNode;
};

/**
 * Chrome for the standalone content pages (About, Terms, Privacy, Cookies,
 * AI Disclosure). Reuses the landing page's nav, footer and design tokens so
 * the pages read as part of the same site.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: PageShellProps) {
  return (
    <div className="lnd">
      <Nav />
      <main className="lnd-page">
        <div className="lnd-container">
          <header className="lnd-page__head">
            <p className="lnd-eyebrow">{eyebrow}</p>
            <h1 className="lnd-h1">{title}</h1>
            {intro && <p className="lnd-page__intro">{intro}</p>}
            {updated && <p className="lnd-fine">{updated}</p>}
          </header>

          <div className="lnd-prose">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
