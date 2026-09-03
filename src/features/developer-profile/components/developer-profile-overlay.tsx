"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { usePlanetStore } from "@/features/planet/stores/planet-store"

import { DeveloperProfileCard } from "./developer-profile-card"

const ENTER_DELAY_MS = 550
const EXIT_UNMOUNT_MS = 100

/**
 * Left-side developer dossier card. Mounted permanently in the planet layout and
 * driven by `viewedGithubLogin`, so it fades in/out while the shared canvas stays put.
 */
export function DeveloperProfileOverlay() {
  const router = useRouter()
  const viewedGithubLogin = usePlanetStore((s) => s.viewedGithubLogin)

  const [renderedLogin, setRenderedLogin] = useState(viewedGithubLogin)
  const [visible, setVisible] = useState(false)
  const profileOpenRef = useRef(false)

  // Sync exit / login switch during render
  if (!viewedGithubLogin && visible) {
    setVisible(false)
  }
  if (viewedGithubLogin && renderedLogin !== viewedGithubLogin) {
    setRenderedLogin(viewedGithubLogin)
  }

  // Handle enter/exit transitions
  useEffect(() => {
    if (!viewedGithubLogin) {
      profileOpenRef.current = false
      const timeout = setTimeout(() => setRenderedLogin(null), EXIT_UNMOUNT_MS)
      return () => clearTimeout(timeout)
    }

    if (profileOpenRef.current) return

    const timeout = setTimeout(() => {
      setVisible(true)
      profileOpenRef.current = true
    }, ENTER_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [viewedGithubLogin])

  // Close on escape key
  useEffect(() => {
    if (!viewedGithubLogin) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      e.preventDefault()
      router.push("/")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [viewedGithubLogin, router])

  return (
    <div
      className="absolute inset-y-32 left-32 z-50 flex w-[min(32rem,calc(100%-4rem))] flex-col transition-all duration-500 ease-out max-profile-full:inset-0 max-profile-full:w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-1.25rem)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {renderedLogin && (
        <DeveloperProfileCard key={renderedLogin} login={renderedLogin} />
      )}
    </div>
  )
}
