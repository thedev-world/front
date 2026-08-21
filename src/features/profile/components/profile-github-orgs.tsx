"use client";

import { Building2 } from "lucide-react";

import { HudReadoutShell } from "@/components/ui/hud-panel";
import { GitHubSignInButton } from "@/features/auth/components/github-sign-in-button";

export function ProfileGitHubOrganizationsCard() {
  return (
    <section className="anim-reveal-up" style={{ animationDelay: "120ms" }}>
      <HudReadoutShell innerClassName="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2 text-hi">
              <Building2 size={16} aria-hidden />
              <h2 className="ticker text-xs uppercase tracking-[0.24em]">
                Update GitHub authorization
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
              Working in a new organization? Refresh your GitHub authorization to
              add the organizations you want (read-only) so your work there is
              included in your score.
            </p>
          </div>
          <GitHubSignInButton
            variant="secondary"
            className="shrink-0 self-start sm:mt-0.5"
            returnTo="/profile?github_refresh=1"
            promptConsent
          >
            Update GitHub access
          </GitHubSignInButton>
        </div>
      </HudReadoutShell>
    </section>
  );
}
