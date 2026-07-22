"use client";

import { useMemo } from "react";

import { PageStatusBar } from "@/components/ui/page-status-bar";
import { useMe } from "@/features/auth/api/use-me";
import {
  ProfileError,
  ProfileLoading,
  ProfileUnauthorized,
} from "@/features/profile/components/profile-states";
import { CosmicBackdrop } from "@/features/profile/components/cosmic-backdrop";
import { useMyReadme } from "@/features/readme-share/api/use-my-readme";
import { ReadmeWorkspace } from "@/features/readme-share/components/readme-workspace";

export function ReadmeShareDashboard() {
  const me = useMe();
  const myReadme = useMyReadme(Boolean(me.data));

  const rawGithubContent = useMemo(() => {
    if (myReadme.isError) return "";
    return myReadme.data?.content ?? "";
  }, [myReadme.data, myReadme.isError]);

  const isLoading =
    me.isPending || (Boolean(me.data) && myReadme.isPending);

  const readmeSource = myReadme.isError
    ? ("fallback" as const)
    : (myReadme.data?.source ?? "empty");

  return (
    <main className="relative flex h-svh w-full flex-col overflow-hidden">
      <CosmicBackdrop />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hex-grid-corner opacity-[0.05]"
      />

      {isLoading ? (
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

      {me.data && !isLoading ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-white/10 bg-[#010409]/80 px-4 py-3 backdrop-blur-sm sm:px-6">
            <PageStatusBar section="readme" githubLogin={me.data.github_login} />
          </div>

          <ReadmeWorkspace
            githubLogin={me.data.github_login}
            rawGithubContent={rawGithubContent}
            source={readmeSource}
          />
        </div>
      ) : null}
    </main>
  );
}
