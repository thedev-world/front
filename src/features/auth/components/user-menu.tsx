"use client"

import { ChevronDown, FileCode2, LogOut, User } from "lucide-react"
import Link from "next/link"

import { BadgeGlow } from "@/components/ui/badge-glow"
import { HudReadoutShell } from "@/components/ui/hud-panel"
import { UserAvatar } from "@/components/ui/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuDestructiveItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/features/auth/api/use-logout"
import type { MeProfile } from "@/features/auth/types/me"
import {
  BADGE_BY_SLUG,
  PLAYER_CLASS_FALLBACK,
  type PlayerClassSlug,
} from "@/features/developer/lib/player-class"
import { useMediaQuery } from "@/hooks/use-media-query"
import { BREAKPOINTS, mediaQuery } from "@/lib/breakpoints"
import { cn } from "@/lib/utils"

type Props = {
  user: MeProfile
}

export function UserMenu({ user }: Props) {
  const logoutMutation = useLogout()
  const isMobile = useMediaQuery(mediaQuery.max(BREAKPOINTS.hudMobile))
  const slug = user.player_class.name.trim().toLowerCase() as PlayerClassSlug
  const badge = BADGE_BY_SLUG[slug] ?? PLAYER_CLASS_FALLBACK.badge

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="User menu">
        <UserAvatar
          githubLogin={user.github_login}
          avatarUrl={user.avatar_url}
          className="hidden max-hud-mobile:block"
        />

        <HudReadoutShell
          className="max-hud-mobile:hidden"
          innerClassName={[
            "flex h-10 items-stretch overflow-hidden p-0"
          ].join(" ")}
        >
          <UserAvatar
            githubLogin={user.github_login}
            avatarUrl={user.avatar_url}
            chamfer={{ topLeft: false, bottomLeft: false }}
          />

          <div className="flex min-w-0 flex-1 items-center gap-2 pl-2.5 pr-3">
            <div className="flex w-[110px] min-w-0 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-1">
                <span className="truncate text-[11px] font-semibold leading-none text-white">
                  @{user.github_login}
                </span>
                <span className="ticker shrink-0 text-[9px] font-semibold leading-none text-hi">
                  Lv.{user.xp_progress.level}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-[8px] uppercase tracking-[0.12em] text-zinc-500">
                  {user.player_class.name}
                </span>
                <div className="relative h-[3px] flex-1 overflow-hidden border border-white/[0.08] bg-white/[0.05]">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${user.xp_progress.percent}%`,
                      background:
                        "linear-gradient(90deg, oklch(0.52 0.20 282) 0%, oklch(0.72 0.19 288) 100%)",
                    }}
                  />
                </div>
              </div>
            </div>

            <BadgeGlow
              src={badge}
              alt=""
              width={26}
              height={26}
              className="size-[26px] shrink-0"
              intensity="subtle"
            />

            <ChevronDown
              size={11}
              className="shrink-0 text-zinc-600 transition-transform duration-200 group-aria-expanded:rotate-180"
            />
          </div>
        </HudReadoutShell>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        matchAnchorWidth={!isMobile}
        className={cn(isMobile && "min-w-[13rem]")}
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <DropdownMenuItem
          render={
            <Link href="/profile">
              <User size={13} className="text-hi" />
              View my profile
            </Link>
          }
        />

        <DropdownMenuItem
          render={
            <Link href="/readme">
              <FileCode2 size={13} className="text-hi" />
              Add to README
            </Link>
          }
        />

        <DropdownMenuSeparator />

        <DropdownMenuDestructiveItem
          disabled={logoutMutation.isPending}
          onClick={() => void logoutMutation.mutate()}
        >
          <LogOut size={13} className="shrink-0" />
          Logout
        </DropdownMenuDestructiveItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
