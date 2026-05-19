"use client";

import type { ReactNode } from "react";
import { formatFullNumber } from "@/features/profile/lib/format";
import { useCountUp } from "@/features/profile/lib/use-count-up";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  icon?: ReactNode;
  emphasis?: boolean;
  delay?: number;
};

export function StatTile({
  label,
  value,
  icon,
  emphasis = false,
  delay = 0,
}: Props) {
  const animated = useCountUp(value, { duration: 1500, delay: 250 + delay });

  return (
    <div
      className={cn(
        "group relative flex min-h-[110px] flex-col justify-between border border-white/[0.06] bg-white/[0.015] p-4 transition-colors duration-300 hover:border-white/12 sm:p-5 anim-reveal-up",
        emphasis && "border-hi/25",
      )}
      style={{ animationDelay: `${120 + delay}ms` }}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-muted-foreground">
        {icon ? (
          <span
            className={cn(
              "flex h-3.5 w-3.5 items-center justify-center [&_svg]:size-3.5",
              emphasis ? "text-hi" : "text-muted-foreground",
            )}
          >
            {icon}
          </span>
        ) : null}
        <span className="ticker">{label}</span>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span
          className={cn(
            "text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold leading-none ticker-tabular",
            emphasis ? "text-hi" : "text-foreground/80",
          )}
          style={
            emphasis
              ? {
                  textShadow:
                    "0 0 18px oklch(0.62 0.19 260 / 0.25), 0 0 50px oklch(0.5 0.18 260 / 0.12)",
                }
              : undefined
          }
        >
          {formatFullNumber(Math.round(animated))}
        </span>
      </div>
    </div>
  );
}
