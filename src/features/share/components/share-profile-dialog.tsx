"use client";

import { useMemo } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HudDialog } from "@/components/ui/hud-dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { MeProfile } from "@/features/auth/types/me";
import {
  buildProfileShareMessage,
  buildProfileShareTweetBody,
  getProfileShareLinkPreview,
} from "@/features/share/lib/build-share-message";
import { shareOnX } from "@/features/share/lib/share-on-x";

type Props = {
  user: MeProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareProfileDialog({ user, open, onOpenChange }: Props) {
  const tweetBody = useMemo(
    () => buildProfileShareTweetBody(),
    [],
  );
  const message = useMemo(
    () => buildProfileShareMessage(user),
    [user],
  );
  const preview = useMemo(
    () => getProfileShareLinkPreview(user),
    [user],
  );

  return (
    <HudDialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Share on X"
      ariaLabel="Share profile on X"
      closeLabel="Close share dialog"
      icon={<Share2 size={12} className="shrink-0 text-zinc-400" />}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex gap-3 mb-2">
          <UserAvatar
            githubLogin={user.github_login}
            avatarUrl={user.avatar_url}
            size="sm"
            className="shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-none text-white">
              @{user.github_login}
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {tweetBody}
            </p>

            <a
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block overflow-hidden border border-white/[0.12] transition-colors hover:border-white/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.imageUrl}
                alt=""
                className="aspect-[1.91/1] w-full object-cover object-top"
              />
              <div className="border-t border-white/[0.08] bg-black/20 px-3 py-2.5">
                <p className="text-[11px] leading-none text-zinc-500">
                  {preview.domain}
                </p>
                <p className="mt-1 line-clamp-1 text-sm font-medium leading-snug text-zinc-100">
                  {preview.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-zinc-500">
                  {preview.description}
                </p>
              </div>
            </a>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => shareOnX(message)}
        >
          <Share2 size={12} className="shrink-0" />
          Share on X
        </Button>
      </div>
    </HudDialog>
  );
}
