"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitHubSignInButton } from "./github-sign-in-button"
import { LogoutButton } from "./logout-button"
import { useMe } from "../api/use-me"
import { loginInitials } from "../lib/login-initials"

export function AuthHeader() {
  const me = useMe()

  if (me.isPending) return null

  return (
    <div className="absolute left-4 top-4 z-40 flex items-center gap-3">
      {me.data ? (
        <>
          <Avatar aria-label={me.data.github_login}>
            {me.data.avatar_url ? (
              <AvatarImage src={me.data.avatar_url} alt={`Your avatar, ${me.data.github_login}`} />
            ) : null}
            <AvatarFallback>{loginInitials(me.data.github_login)}</AvatarFallback>
          </Avatar>
          <LogoutButton />
        </>
      ) : (
        <GitHubSignInButton />
      )}
    </div>
  )
}
