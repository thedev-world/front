"use client"

import { GitHubSignInButton } from "./github-sign-in-button"
import { LogoutButton } from "./logout-button"
import { useMe } from "../api/use-me"

export function AuthHeader() {
  const me = useMe()

  if (me.isPending) return null

  return (
    <div className="absolute left-4 top-4 z-40 flex items-center gap-3">
      {me.data ? (
        <>
          <span className="text-sm text-zinc-300">{me.data.github_login}</span>
          <LogoutButton />
        </>
      ) : (
        <GitHubSignInButton />
      )}
    </div>
  )
}
