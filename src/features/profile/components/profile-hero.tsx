"use client";

import type { MeProfile } from "@/features/auth/types/me";
import { BadgeGlow } from "@/components/ui/badge-glow";
import { XpBar } from "@/features/profile/components/xp-bar";
import { formatFullNumber } from "@/features/profile/lib/format";
import {
  resolvePlayerClass,
} from "@/features/profile/lib/player-class";
import { useCountUp } from "@/features/profile/lib/use-count-up";

type Props = {
  profile: MeProfile;
};

export function ProfileHero({ profile }: Props) {
  const klass = resolvePlayerClass(profile.player_class.name);
  const xpDisplay = useCountUp(profile.xp_brut, {
    duration: 1700,
    delay: 250,
  });

  return (
    <section
      className="relative anim-reveal-up"
      style={{ animationDelay: "60ms" }}
    >
      <div className="grid items-center gap-12 md:grid-cols-[280px_1fr] md:gap-16 lg:grid-cols-[320px_1fr] lg:gap-20">
        <BadgeStage src={klass.badge} alt={`${klass.name} rank`} />

        <div className="flex min-w-0 flex-col gap-10">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="ticker text-hi">#</span>
              <span className="ticker uppercase tracking-[0.24em]">
                current rank
              </span>
            </div>

            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight text-white">
              {klass.name}
            </h1>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="ticker">@{profile.github_login}</span>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-x-10 gap-y-2 sm:gap-x-14">
            <div className="flex flex-col gap-2">
              <span className="ticker text-xs uppercase tracking-[0.28em] text-zinc-500">
                Level
              </span>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[clamp(2.5rem,6vw,3.5rem)] font-semibold leading-none ticker-tabular text-hi"
                  style={{
                    textShadow:
                      "0 0 24px oklch(0.62 0.19 260 / 0.3), 0 0 60px oklch(0.5 0.18 260 / 0.15)",
                  }}
                >
                  {profile.xp_progress.level}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <XpBar progress={profile.xp_progress} />
            </div>
          </div>

          <div className="flex items-baseline gap-2.5 border-t border-white/5 pt-6 text-xs uppercase tracking-[0.26em] text-muted-foreground">
            <span className="ticker">Total XP</span>
            <span className="ticker ticker-tabular text-base font-medium normal-case tracking-normal text-foreground/80">
              {formatFullNumber(xpDisplay | 0)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BadgeStage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto flex aspect-square w-[240px] items-center justify-center sm:w-[280px] md:w-full">
      <BadgeGlow
        src={src}
        alt={alt}
        width={520}
        height={520}
        priority
        intensity="strong"
        className="h-full w-full"
        imageClassName=""
      />
    </div>
  );
}
