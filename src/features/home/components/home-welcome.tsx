"use client";

import { GitHubSignInButton } from "@/features/auth/components/github-sign-in-button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useMe } from "@/features/auth/api/use-me";

export function HomeWelcome() {
  const me = useMe();

  return (
    <section className="flex max-w-lg flex-col gap-4 text-center sm:text-left">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Devplanet
      </h1>
      <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        Hello world
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
        {me.isPending ? (
          <p className="text-sm text-zinc-500">Chargement de la session…</p>
        ) : me.data ? (
          <>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Hey{" "}
              <span className="font-medium">{me.data.github_login}</span>
            </p>
            <LogoutButton />
          </>
        ) : (
          <>
            <GitHubSignInButton />
            {me.error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Impossible to load your profile. Try again.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
