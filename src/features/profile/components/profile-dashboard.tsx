"use client";

import { useMe } from "@/features/auth/api/use-me";
import { CellsShowcase } from "@/features/profile/components/cells-showcase";
import { CosmicBackdrop } from "@/features/profile/components/cosmic-backdrop";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import {
  ProfileError,
  ProfileLoading,
  ProfileUnauthorized,
} from "@/features/profile/components/profile-states";
import { ProfileStatusBar } from "@/features/profile/components/profile-status-bar";
import { RankProgression } from "@/features/profile/components/rank-progression";

export function ProfileDashboard() {
  const me = useMe();

  return (
    <main className="relative min-h-svh w-full">
      <CosmicBackdrop />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hex-grid-corner opacity-[0.08]"
      />

      <div className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:gap-16 sm:px-6 sm:py-14 lg:gap-20 lg:px-8 lg:py-20">
        {me.isPending ? <ProfileLoading /> : null}

        {!me.isPending && !me.data && me.error ? (
          <ProfileError
            message={
              me.error instanceof Error
                ? me.error.message
                : "Unknown error"
            }
          />
        ) : null}

        {!me.isPending && !me.data && !me.error ? <ProfileUnauthorized /> : null}

        {me.data ? (
          <>
            <ProfileStatusBar
              githubLogin={me.data.github_login}
              nextSyncAt={me.data.next_sync_at}
            />
            <ProfileHero profile={me.data} />
            <CellsShowcase profile={me.data} />
            <RankProgression profile={me.data} />
          </>
        ) : null}
      </div>
    </main>
  );
}
