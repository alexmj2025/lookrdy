"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/client";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#looks", label: "Looks" },
  { href: "/#contact", label: "Contact Us" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="lnd-nav" data-scrolled={scrolled}>
      <div className="lnd-container">
        <div className="lnd-nav__inner">
          <Link href="/" className="lnd-nav__mark">
            Lookrdy
          </Link>

          <nav className="lnd-nav__links" aria-label="Primary">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <Link
            href="/photo"
            className="lnd-btn lnd-btn--dark lnd-btn--sm"
            onClick={() => track("started")}
          >
            Try it free
          </Link>

          <button
            type="button"
            className="lnd-nav__burger"
            aria-expanded={open}
            aria-controls="lnd-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {open && (
          <nav id="lnd-menu" className="lnd-nav__sheet" aria-label="Mobile">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link
              href="/photo"
              className="lnd-btn lnd-btn--dark"
              onClick={() => {
                track("started");
                setOpen(false);
              }}
            >
              Try it free
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
