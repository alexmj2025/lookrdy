import Link from "next/link";

export function Wordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      className={`wordmark ${size === "lg" ? "text-3xl md:text-4xl" : "text-lg"}`}
    >
      lookrdy
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-10">
        <Link href="/" aria-label="Lookrdy home">
          <Wordmark />
        </Link>
        <Link href="/request" className="label hover:text-[var(--color-ink)]">
          New look
        </Link>
      </div>
    </header>
  );
}
