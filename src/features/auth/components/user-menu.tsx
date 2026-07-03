"use client"

import { ChevronDown, LogOut, User } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeGlow } from "@/components/ui/badge-glow"
import { HudReadoutShell } from "@/components/ui/hud-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuDestructiveItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/features/auth/api/use-logout"
import { loginInitials } from "@/features/auth/lib/login-initials"
import type { MeProfile } from "@/features/auth/types/me"
import {
  BADGE_BY_SLUG,
  PLAYER_CLASS_FALLBACK,
  type PlayerClassSlug,
} from "@/features/profile/lib/player-class"

const avatarClassName = [
  "user-menu-avatar-inner h-full w-full rounded-none ring-0",
  "after:hidden",
  "[&_[data-slot=avatar-image]]:rounded-none",
  "[&_[data-slot=avatar-fallback]]:rounded-none",
].join(" ")

type Props = {
  user: MeProfile
}

export function UserMenu({ user }: Props) {
  const logoutMutation = useLogout()
  const slug = user.player_class.name.trim().toLowerCase() as PlayerClassSlug
  const badge = BADGE_BY_SLUG[slug] ?? PLAYER_CLASS_FALLBACK.badge

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="User menu">
        <HudReadoutShell
          innerClassName={[
            "flex h-10 items-stretch overflow-hidden p-0"
          ].join(" ")}
        >
          <div className="h-full w-10 shrink-0">
            <div className="user-menu-avatar-border">
              <Avatar className={avatarClassName}>
                {user.avatar_url ? (
                  <AvatarImage
                    src={user.avatar_url}
                    alt={`Avatar de ${user.github_login}`}
                  />
                ) : null}
                <AvatarFallback className="text-[11px]">
                  {loginInitials(user.github_login)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

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

      <DropdownMenuContent matchAnchorWidth side="bottom" align="start" sideOffset={8}>
        <DropdownMenuItem
          render={
            <Link href="/profile">
              <User size={13} className="text-hi" />
              View my profile
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
