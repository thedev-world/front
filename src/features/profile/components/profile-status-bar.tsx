"use client";

import { formatRelativeTime } from "@/features/profile/lib/format";

type Props = {
  githubLogin: string;
  lastSyncAt: string;
};

export function ProfileStatusBar({ githubLogin, lastSyncAt }: Props) {
  return (
    <header className="anim-reveal-in flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/5 pb-5 text-xs">
      <span className="ticker uppercase tracking-[0.22em]">
        <span className="text-muted-foreground">profile</span>
        <span className="mx-1 text-muted-foreground/40">/</span>
        <span className="text-foreground/80">@{githubLogin}</span>
      </span>

      <span className="ml-auto flex items-baseline gap-2 text-xs uppercase tracking-[0.22em]">
        <span className="text-muted-foreground/60">updated</span>
        <span className="ticker tracking-normal normal-case text-muted-foreground">
          {formatRelativeTime(lastSyncAt)}
        </span>
      </span>
    </header>
  );
}
