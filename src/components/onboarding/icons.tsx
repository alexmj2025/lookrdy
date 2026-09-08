/** Inline icons for the onboarding flow. Stroked to match the landing set. */

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Check = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m4 12 5 5L20 6" />
  </svg>
);

export const ArrowRight = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowLeft = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </svg>
);

export const Upload = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 16V4" />
    <path d="m6 10 6-6 6 6" />
    <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
  </svg>
);

export const Lock = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const Heart = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z" />
  </svg>
);

export const Star = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m12 4 2.35 4.76 5.25.77-3.8 3.7.9 5.23L12 16l-4.7 2.46.9-5.23-3.8-3.7 5.25-.77Z" />
  </svg>
);

export const Person = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

export const Sun = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

export const Stand = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v7M9 21l3-7 3 7M8 10h8" />
  </svg>
);

export const Shirt = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9 3 5 5v5h2v11h10V10h2V5l-4-2a3 3 0 0 1-6 0Z" />
  </svg>
);

export const NoFilter = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m6 18 12-12" />
  </svg>
);

export const People = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="9" cy="9" r="3" />
    <path d="M3 19a6 6 0 0 1 12 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.9M17 19a6 6 0 0 0-2-4.4" />
  </svg>
);

export const Pin = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 21s6.5-5.6 6.5-10a6.5 6.5 0 1 0-13 0c0 4.4 6.5 10 6.5 10Z" />
    <circle cx="12" cy="11" r="2.4" />
  </svg>
);

export const Coins = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <ellipse cx="12" cy="6.5" rx="7" ry="3" />
    <path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    <path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
  </svg>
);

export const Sparkle = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
  </svg>
);

export const Close = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
