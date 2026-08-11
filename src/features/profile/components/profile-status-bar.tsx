"use client";

import { PageStatusBar } from "@/components/ui/page-status-bar";
import { useNextSyncCountdown } from "@/features/profile/lib/use-next-sync-countdown";

type Props = {
  githubLogin: string;
  nextSyncAt: string | null;
};

export function ProfileStatusBar({ githubLogin, nextSyncAt }: Props) {
  const { countdown, isReady } = useNextSyncCountdown(nextSyncAt);

  return (
    <PageStatusBar
      section="profile"
      githubLogin={githubLogin}
      trailing={
        <span className="flex items-baseline gap-2 text-xs uppercase tracking-[0.22em]">
          <span className={isReady ? "text-hi/80" : "text-muted-foreground/60"}>
            {isReady ? "sync ready" : "next sync in"}
          </span>
          {!isReady && (
            <span className="ticker tracking-normal normal-case tabular-nums text-muted-foreground">
              {countdown}
            </span>
          )}
        </span>
      }
    />
  );
}
