"use client"

import { useEffect } from "react"

import { usePlanetStore } from "@/features/planet/stores/planet-store"

type Props = {
  githubLogin: string | null
}

/**
 * Syncs the route (`/` → null, `/u/{login}` → githubLogin) into `viewedGithubLogin`.
 * Rendered by each planet page so navigation only updates the store — the shared
 * layout keeps the canvas mounted, so the transition never remounts the scene.
 */
export function ViewedGithubLoginSync({ githubLogin }: Props) {
  const setViewedGithubLogin = usePlanetStore((s) => s.setViewedGithubLogin)
  const setIntroPhase = usePlanetStore((s) => s.setIntroPhase)

  useEffect(() => {
    setViewedGithubLogin(githubLogin)
    // Deep-link to a developer dossier: skip the cinematic intro, focus straight away.
    if (githubLogin) setIntroPhase("done")
    return () => {
      // Only clear when this route still owns the store value
      // when switching /u/alice -> /u/bob (old instance unmounts after the new one sets bob)
      if (usePlanetStore.getState().viewedGithubLogin === githubLogin) {
        setViewedGithubLogin(null)
      }
    }
  }, [githubLogin, setViewedGithubLogin, setIntroPhase])

  return null
}
