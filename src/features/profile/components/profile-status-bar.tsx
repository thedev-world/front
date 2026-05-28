"use client";

import { useNextSyncCountdown } from "@/features/profile/lib/use-next-sync-countdown";

type Props = {
  githubLogin: string;
  nextSyncAt: string | null;
};

export function ProfileStatusBar({ githubLogin, nextSyncAt }: Props) {
  const { countdown, isReady } = useNextSyncCountdown(nextSyncAt);

  return (
    <header className="anim-reveal-in flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/5 pb-5 text-xs">
      <span className="ticker uppercase tracking-[0.22em]">
        <span className="text-muted-foreground">profile</span>
        <span className="mx-1 text-muted-foreground/40">/</span>
        <span className="text-foreground/80">@{githubLogin}</span>
      </span>

      <span className="ml-auto flex items-baseline gap-2 text-xs uppercase tracking-[0.22em]">
        <span className={isReady ? "text-hi/80" : "text-muted-foreground/60"}>
          {isReady ? "sync ready" : "next sync in"}
        </span>
        {!isReady && countdown && (
          <span className="ticker tracking-normal normal-case tabular-nums text-muted-foreground">
            {countdown}
          </span>
        )}
      </span>
    </header>
  );
}
