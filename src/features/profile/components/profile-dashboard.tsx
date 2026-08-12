"use client";

import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { DashboardPageShell } from "@/components/ui/dashboard-page-shell";
import { PageScroll } from "@/components/ui/page-scroll";
import { useMe } from "@/features/auth/api/use-me";
import { CellsShowcase } from "@/features/profile/components/cells-showcase";
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
    <DashboardPageShell>
      {me.isPending ? (
        <div className="relative flex flex-1 items-center justify-center">
          <ProfileLoading />
        </div>
      ) : null}

      {!me.isPending && !me.data && me.error ? (
        <div className="relative flex flex-1 items-center justify-center">
          <ProfileError
            message={
              me.error instanceof Error ? me.error.message : "Unknown error"
            }
          />
        </div>
      ) : null}

      {!me.isPending && !me.data && !me.error ? (
        <div className="relative flex flex-1 items-center justify-center">
          <ProfileUnauthorized />
        </div>
      ) : null}

      {me.data ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <DashboardPageHeader>
            <ProfileStatusBar
              githubLogin={me.data.github_login}
              nextSyncAt={me.data.next_sync_at}
            />
          </DashboardPageHeader>

          <PageScroll>
            <div className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:gap-16 sm:px-6 sm:py-10 lg:gap-20 lg:px-8 lg:py-12">
              <ProfileHero profile={me.data} />
              <CellsShowcase profile={me.data} />
            </div>
            <RankProgression profile={me.data} />
          </PageScroll>
        </div>
      ) : null}
    </DashboardPageShell>
  );
}
