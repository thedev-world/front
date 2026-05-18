import { createElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Level = 2 | 3;

type Props = {
  id: string;
  title: ReactNode;
  /** Prompt-style glyph (e.g. `$`, `#`). Decorative — heading stays the accessible name. */
  prefix?: ReactNode;
  /** Inline metadata displayed after title with subtle styling */
  meta?: ReactNode;
  level?: Level;
  className?: string;
};

const metaId = (headingId: string) => `${headingId}-meta`;

/**
 * Section heading with inline metadata and optional prefix glyph.
 * Clean, horizontal layout for better visual flow.
 */
export function SectionTickerHeading({
  id,
  title,
  prefix = "#",
  meta,
  level = 2,
  className,
}: Props) {
  const headingClassName =
    "ticker text-sm font-medium uppercase tracking-[0.2em] text-zinc-200 sm:text-base";

  const metaEl = meta ? (
    <span
      id={metaId(id)}
      className="ticker ml-3 text-xs font-normal uppercase tracking-[0.16em] text-zinc-500 sm:ml-4 sm:text-sm"
    >
      {meta}
    </span>
  ) : null;

  return (
    <div className={cn("flex items-baseline gap-2.5", className)}>
      <span
        className="ticker shrink-0 text-sm leading-none text-zinc-600 sm:text-base"
        aria-hidden
      >
        {prefix}
      </span>
      {createElement(
        `h${level}`,
        {
          id,
          className: cn(headingClassName, "flex items-baseline"),
          ...(meta ? { "aria-describedby": metaId(id) } : {}),
        },
        <>
          {title}
          {metaEl}
        </>,
      )}
    </div>
  );
}
