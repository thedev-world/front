"use client";

import { Hexagon } from "lucide-react";
import type { MeProfile } from "@/features/auth/types/me";
import { useCountUp } from "@/features/profile/lib/use-count-up";

type Props = { profile: MeProfile };

export function CellsShowcase({ profile }: Props) {
  const cellsDisplay = useCountUp(profile.cell_count, { duration: 2000, delay: 150 });

  return (
    <section
      className="relative anim-reveal-up"
      style={{ animationDelay: "100ms" }}
      aria-labelledby="cells-heading"
    >
      <div className="relative overflow-hidden border border-white/[0.08] bg-white/[0.02]">

        {/* Ambient glow top-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.19 260 / 0.25) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />


        <div className="relative z-10 grid items-center gap-10 px-8 py-10 sm:grid-cols-[1fr_auto] sm:px-10 lg:px-12 lg:py-12">

          {/* Left */}
          <div className="flex flex-col gap-5">
            <h2
              id="cells-heading"
              className="ticker text-sm font-medium uppercase tracking-widest text-foreground/70"
            >
              Territory
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Each commit, review, and contribution anchors a cell to your
              territory across the network.
            </p>
          </div>

          {/* Right: number inside a hexagon cell */}
          <div className="relative flex items-center justify-center">
            <Hexagon
              className="text-hi"
              strokeWidth={0.75}
              style={{
                width: "clamp(7rem, 14vw, 9rem)",
                height: "clamp(7rem, 14vw, 9rem)",
                filter: "drop-shadow(0 0 18px oklch(0.62 0.19 260 / 0.35))",
              }}
            />
            <div className="absolute flex flex-col items-center gap-0.5">
              <span
                className="font-semibold leading-none tracking-tight text-hi ticker-tabular"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}
              >
                {Math.round(cellsDisplay)}
              </span>
              <span className="ticker text-xs uppercase tracking-widest text-muted-foreground">
                cells
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
