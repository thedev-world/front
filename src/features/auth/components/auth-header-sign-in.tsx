"use client";

import { useState } from "react";

import { HudDialog } from "@/components/ui/hud-dialog";
import { Button } from "@/components/ui/button";
import { GitHubSignInPanel } from "@/features/auth/components/github-sign-in-panel";
import { useHasEverConnected } from "@/features/auth/hooks/use-has-ever-connected";
import { redirectToGitHubOAuth } from "@/features/auth/lib/github-oauth";

import { GithubIcon } from "./github-icon";

export function AuthHeaderSignIn() {
  const [open, setOpen] = useState(false);
  const hasEverConnected = useHasEverConnected();

  function handleClick() {
    if (hasEverConnected) {
      redirectToGitHubOAuth();
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <Button variant="primary" className="gap-2" onClick={handleClick}>
        <GithubIcon className="size-4 shrink-0" />
        Sign in with GitHub
      </Button>

      {!hasEverConnected ? (
        <HudDialog
          open={open}
          onOpenChange={setOpen}
          title="Sign in with GitHub"
          ariaLabel="Sign in with GitHub"
          size="md"
        >
          <GitHubSignInPanel />
        </HudDialog>
      ) : null}
    </>
  );
}
