"use client";

import { useEffect, useRef, useState } from "react";

type PhotoProps = {
  /** Path under /public, e.g. "/landing/hero/original.jpg". */
  src: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "3 / 4". Omit to let the parent size it. */
  ratio?: string;
  className?: string;
  priority?: boolean;
};

/**
 * A photo slot that degrades to a labelled placeholder.
 *
 * The repo ships without photography, so every slot renders a cream swatch
 * printing the file it is waiting for. Drop a correctly named image into
 * /public/landing/... and it appears — no code change needed.
 *
 * Deliberately a plain <img> rather than next/image: a missing file must not
 * break the build, and we need the onError hook to fall back.
 */
export function Photo({ src, alt, ratio, className, priority }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The browser may finish (and fail) the request before React attaches the
  // onError handler, so re-check the decoded size once on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <span
      className={["lnd-photo", className].filter(Boolean).join(" ")}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {!failed && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <span className="lnd-photo__ph" aria-hidden="true">
          <strong>Add photo</strong>
          <span>{src.replace("/landing/", "")}</span>
        </span>
      )}
    </span>
  );
}
