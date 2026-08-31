"use client";

import { GitHubSignInButton } from "@/features/auth/components/github-sign-in-button";
import { GitHubSignInPanel } from "@/features/auth/components/github-sign-in-panel";
import { useHasEverConnected } from "@/features/auth/hooks/use-has-ever-connected";

export function ProfileLoading() {
  return (
    <div
      className="anim-reveal-in flex flex-col items-center justify-center gap-3 px-6 py-24 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="relative inline-flex h-2 w-2" aria-hidden="true">
        <span className="inline-block h-2 w-2 rounded-full bg-hi/80" />
      </span>
      <p className="ticker text-xs uppercase tracking-[0.24em] text-zinc-400">
        loading profile
      </p>
    </div>
  );
}

export function ProfileUnauthorized() {
  const hasEverConnected = useHasEverConnected();

  return (
    <div className="anim-reveal-in mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-24 text-center">
      <p className="ticker text-xs uppercase tracking-[0.26em] text-zinc-500">
        sign in required
      </p>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">
        {hasEverConnected ? "Sign back in" : "Connect your GitHub account"}
      </h1>
      <p className="text-balance text-sm text-zinc-400">
        {hasEverConnected
          ? "Your territory is waiting on the planet."
          : "Your profile loads from your public GitHub activity."}
      </p>
      {hasEverConnected ? (
        <GitHubSignInButton className="mt-2" returnTo="/profile">
          Sign in with GitHub
        </GitHubSignInButton>
      ) : (
        <GitHubSignInPanel className="mt-2" returnTo="/profile" />
      )}
    </div>
  );
}

export function ProfileError({ message }: { message: string }) {
  return (
    <div className="anim-reveal-in mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-24 text-center">
      <p className="ticker text-xs uppercase tracking-[0.26em] text-red-400/80">
        error
      </p>
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">
        Could not load profile
      </h1>
      <p className="ticker text-xs text-zinc-500">{message}</p>
    </div>
  );
}
