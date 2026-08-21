"use client";

import { useEffect } from "react";
import { GitHubReauthRequiredError, useMe } from "@/features/auth/api/use-me";
import { redirectToGitHubOAuth } from "@/features/auth/lib/github-oauth";

/** Redirect to GitHub OAuth when GET /me returns 401 github_reauth_required. */
export function useGitHubReauthRedirect() {
  const { error, isPending } = useMe();

  useEffect(() => {
    if (isPending) return;
    if (error instanceof GitHubReauthRequiredError) {
      redirectToGitHubOAuth({
        returnTo: `${window.location.pathname}${window.location.search}`,
        promptConsent: true,
      });
    }
  }, [error, isPending]);
}
