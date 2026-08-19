"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-reveal via a single IntersectionObserver per element. The observer
 * flips `data-revealed` to "true" and immediately unobserves — reveals are
 * one-way, so nothing re-animates when the user scrolls back up.
 *
 * Users who ask for reduced motion get the revealed state on mount; the CSS
 * side of the animation is also disabled in globals-adjacent landing.css.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Anything already on screen at mount reveals straight away: it avoids a
    // first-paint flash, and it means the hero is never left invisible if the
    // observer has no rendering opportunity (background tab, hidden pane).
    const inView = node.getBoundingClientRect().top < window.innerHeight * 0.9;

    if (reduced || inView || typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}
