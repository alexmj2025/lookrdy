import Link from "next/link";
import { Logo } from "./Logo";

/**
 * The brand mark for the app flow pages. Renders the supplied logo rather
 * than the old serif text wordmark, so the flow matches the landing page.
 */
export function Wordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  return <Logo height={size === "lg" ? 34 : 20} />;
}

export function SiteHeader() {
  return (
    <header className="border-b hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-10">
        <Link href="/" aria-label="Lookrdy home" className="inline-flex">
          <Wordmark />
        </Link>
        <Link href="/request" className="label hover:text-[var(--color-ink)]">
          New look
        </Link>
      </div>
    </header>
  );
}
