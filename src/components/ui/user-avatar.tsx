"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { loginInitials } from "@/features/auth/lib/login-initials"
import { cn } from "@/lib/utils"

const CHAMFER_SIZE_PX = 6

export type ChamferCorners = {
  topLeft?: boolean
  topRight?: boolean
  bottomLeft?: boolean
  bottomRight?: boolean
}

const DEFAULT_CHAMFER: Required<ChamferCorners> = {
  topLeft: true,
  topRight: true,
  bottomLeft: true,
  bottomRight: true,
}

const CHAMFER_CORNER_SEGMENTS: {
  key: keyof ChamferCorners
  sharp: [string]
  cut: (c: string) => [string, string]
}[] = [
  { key: "topLeft", sharp: ["0% 0%"], cut: (c) => [`0% ${c}`, `${c} 0%`] },
  { key: "topRight", sharp: ["100% 0%"], cut: (c) => [`calc(100% - ${c}) 0%`, `100% ${c}`] },
  { key: "bottomRight", sharp: ["100% 100%"], cut: (c) => [`100% calc(100% - ${c})`, `calc(100% - ${c}) 100%`] },
  { key: "bottomLeft", sharp: ["0% 100%"], cut: (c) => [`${c} 100%`, `0% calc(100% - ${c})`] },
]

function buildChamferClipPath(corners: Required<ChamferCorners>): string {
  const c = `${CHAMFER_SIZE_PX}px`
  const points = CHAMFER_CORNER_SEGMENTS.flatMap(({ key, sharp, cut }) =>
    corners[key] ? cut(c) : sharp,
  )
  return `polygon(${points.join(", ")})`
}

type UserAvatarProps = {
  githubLogin: string
  avatarUrl?: string | null
  alt?: string
  className?: string
  size?: "sm" | "md" | "lg"
  loading?: boolean
  chamfer?: ChamferCorners
}

const sizeClasses = {
  sm: "size-9",
  md: "size-10",
  lg: "size-14",
} as const

const fallbackTextClasses = {
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-sm",
} as const

const avatarClassName = [
  "user-menu-avatar-inner h-full w-full rounded-none ring-0",
  "after:hidden",
  "[&_[data-slot=avatar-image]]:rounded-none",
  "[&_[data-slot=avatar-fallback]]:rounded-none",
].join(" ")

export function UserAvatar({
  githubLogin,
  avatarUrl,
  alt,
  className,
  size = "md",
  loading = false,
  chamfer,
}: UserAvatarProps) {
  const label = alt ?? `${githubLogin}'s avatar`
  const clipStyle = {
    clipPath: buildChamferClipPath({ ...DEFAULT_CHAMFER, ...chamfer }),
  }

  return (
    <div className={cn(sizeClasses[size], "shrink-0", className)}>
      <div className="user-menu-avatar-border h-full" style={clipStyle}>
        {loading ? (
          <Skeleton className="h-full w-full rounded-none" style={clipStyle} />
        ) : (
          <Avatar className={avatarClassName} style={clipStyle}>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={label} /> : null}
            <AvatarFallback className={fallbackTextClasses[size]}>
              {loginInitials(githubLogin)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
