"use client"

import { GitHubSignInButton } from "./github-sign-in-button"
import { UserMenu } from "./user-menu"
import { useMe } from "../api/use-me"

export function AuthHeader() {
  const me = useMe()

  if (me.isPending) return null

  return (
    <div className="absolute left-4 top-4 z-40">
      {me.data ? (
        <UserMenu user={me.data} />
      ) : (
        <GitHubSignInButton />
      )}
    </div>
  )
}
