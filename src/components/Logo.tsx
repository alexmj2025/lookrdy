import Image from "next/image";

/** Intrinsic size of the supplied wordmark PNGs. */
const W = 898;
const H = 243;

type LogoProps = {
  /** "dark" for light surfaces, "white" for dark ones. */
  variant?: "dark" | "white";
  /** Rendered height in pixels; width follows the 3.7:1 wordmark ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
};

/**
 * The Lookrdy wordmark. Two supplied variants, both transparent PNGs, so the
 * caller picks by the surface it sits on rather than by theme.
 */
export function Logo({
  variant = "dark",
  height = 22,
  className,
  priority,
}: LogoProps) {
  return (
    <Image
      src={variant === "white" ? "/logo/Variant3.png" : "/logo/Variant3-1.png"}
      alt="Lookrdy"
      width={Math.round((height * W) / H)}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
