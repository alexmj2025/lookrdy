"use client";

import type { ElementType, ReactNode } from "react";
import { useReveal } from "./useReveal";

type RevealProps = {
  children: ReactNode;
  /** Stagger, in milliseconds. Read by CSS as `--d`. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
};

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  id,
}: RevealProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      data-reveal=""
      style={delay ? ({ "--d": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
