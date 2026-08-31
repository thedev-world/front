"use client"

import { UserMenu } from "./user-menu"
import { AuthHeaderSignIn } from "./auth-header-sign-in"
import { useMe } from "../api/use-me"

export function AuthHeader() {
  const me = useMe()

  if (me.isPending) return null

  return (
    <div className="absolute left-4 top-4 z-40">
      {me.data ? (
        <UserMenu user={me.data} />
      ) : (
        <AuthHeaderSignIn />
      )}
    </div>
  )
}
