"use client";

import { Button } from "@/components/ui/button";
import { getGitHubOAuthStartUrl } from "@/features/auth/lib/github-oauth";
import { resolveApiUrl } from "@/lib/api-url";

import { GithubIcon } from "./github-icon";

type Props = {
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  /** Relative path or absolute URL after OAuth (enables return_to + optional consent). */
  returnTo?: string;
  /** Force GitHub consent screen (e.g. add organizations). */
  promptConsent?: boolean;
};

export function GitHubSignInButton({
  className,
  children,
  variant = "secondary",
  returnTo,
  promptConsent = false,
}: Props) {
  const href =
    returnTo || promptConsent
      ? getGitHubOAuthStartUrl({ returnTo, promptConsent })
      : resolveApiUrl("/api/v1/auth/github/start");

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
