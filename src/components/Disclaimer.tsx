export function AiLabel({ className = "" }: { className?: string }) {
  return (
    <p className={`label ${className}`}>
      AI visualization — composed from real, in-stock products
    </p>
  );
}

export function Disclaimer() {
  return (
    <p className="prose-measure text-sm leading-relaxed text-[var(--color-muted)]">
      Images are AI visualizations, not photographs of the actual garments. Fit
      is not guaranteed. Price and stock are confirmed on the retailer&rsquo;s
      site.
    </p>
  );
}
