"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { redirectToGitHubOAuth } from "@/features/auth/lib/github-oauth";
import { cn } from "@/lib/utils";

import { GithubIcon } from "./github-icon";

type Props = {
  className?: string;
  /** Relative path or absolute URL after OAuth. */
  returnTo?: string;
  /** Force GitHub consent screen. */
  promptConsent?: boolean;
};

export function GitHubSignInPanel({
  className,
  returnTo,
  promptConsent = false,
}: Props) {
  const [includeOrgs, setIncludeOrgs] = useState(false);

  function handleSignIn() {
    redirectToGitHubOAuth({ returnTo, promptConsent, includeOrgs });
  }

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-5 p-6", className)}>
      <CheckboxField
        checked={includeOrgs}
        onCheckedChange={setIncludeOrgs}
        title="Include external organizations"
        description="Add stars from organizations where you are an admin (read-only GitHub access). You can enable this later from your profile."
      />

      <Button variant="secondary" size="md" fullWidth onClick={handleSignIn}>
        <GithubIcon className="size-4 shrink-0" />
        Claim your territory
      </Button>
    </div>
  );
}
