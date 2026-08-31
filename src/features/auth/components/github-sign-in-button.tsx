"use client";

import { Button } from "@/components/ui/button";
import { getGitHubOAuthStartUrl } from "@/features/auth/lib/github-oauth";

import { GithubIcon } from "./github-icon";

type Props = {
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  /** Relative path or absolute URL after OAuth (enables return_to + optional consent). */
  returnTo?: string;
  /** Force GitHub consent screen (e.g. add organizations). */
  promptConsent?: boolean;
  /** Request read:org scope to include organization admin repo stars. */
  includeOrgs?: boolean;
};

export function GitHubSignInButton({
  className,
  children,
  variant = "secondary",
  returnTo,
  promptConsent = false,
  includeOrgs = false,
}: Props) {
  const href = getGitHubOAuthStartUrl({ returnTo, promptConsent, includeOrgs });

  return (
    <Button
      variant={variant}
      render={<a href={href} />}
      nativeButton={false}
      className={className}
    >
      <GithubIcon className="size-4 shrink-0" />
      {children ?? "Sign in with GitHub"}
    </Button>
  );
}
