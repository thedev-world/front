import { create } from "zustand"

type MousePos = { x: number; y: number }

type IntroPhase = "idle" | "approach" | "text" | "done"

type PlanetStore = {
  hoveredTerritoryIndex: number | null
  mousePos: MousePos
  setHoveredTerritory: (index: number | null) => void
  setMousePos: (pos: MousePos) => void
  /** True while the onboarding arrival sequence is playing. */
  fromOnboarding: boolean
  /** Elapsed time (seconds) at which the planet rotation was frozen. Null = rotating freely. */
  pausedAt: number | null
  /** GitHub login of the authenticated user — their territory is always highlighted. */
  highlightedGithubLogin: string | null
  /** When true, the reveal animation should skip to completion immediately. */
  skipReveal: boolean
  setFromOnboarding: (v: boolean) => void
  setPausedAt: (v: number | null) => void
  setHighlightedGithubLogin: (v: string | null) => void
  setSkipReveal: (v: boolean) => void
  /** Cinematic intro phase for non-authenticated visitors. */
  introPhase: IntroPhase
  setIntroPhase: (v: IntroPhase) => void
  /** When true, show the onboarding stats overlay after territory reveal. */
  showOnboardingStats: boolean
  setShowOnboardingStats: (v: boolean) => void
  /** Island to focus on (leaderboard accordion open) — triggers camera lerp. */
  focusIslandId: string | null
  setFocusIslandId: (v: string | null) => void
  /** GitHub login to focus on (leaderboard row click) — triggers camera lerp + highlight. */
  focusGithubLogin: string | null
  setFocusGithubLogin: (v: string | null) => void
  /** Screen coordinates (px) of the authenticated user's territory center. */
  myTerritoryScreenPos: MousePos | null
  setMyTerritoryScreenPos: (pos: MousePos | null) => void
  /** True when the user starts dragging the planet (hides the territory connector line). */
  planetInteracted: boolean
  setPlanetInteracted: (v: boolean) => void
  /** True once the camera has finished lerping to the user's island. */
  cameraSettled: boolean
  setCameraSettled: (v: boolean) => void
  /** GitHub login of the developer currently inspected */
  viewedGithubLogin: string | null
  setViewedGithubLogin: (v: string | null) => void
}

export const usePlanetStore = create<PlanetStore>((set) => ({
  hoveredTerritoryIndex: null,
  mousePos: { x: 0, y: 0 },
  setHoveredTerritory: (hoveredTerritoryIndex) => set({ hoveredTerritoryIndex }),
  setMousePos: (mousePos) => set({ mousePos }),
  fromOnboarding: false,
  pausedAt: null,
  highlightedGithubLogin: null,
  skipReveal: false,
  setFromOnboarding: (fromOnboarding) => set({ fromOnboarding }),
  setPausedAt: (pausedAt) => set({ pausedAt }),
  setHighlightedGithubLogin: (highlightedGithubLogin) => set({ highlightedGithubLogin }),
  setSkipReveal: (skipReveal) => set({ skipReveal }),
  showOnboardingStats: false,
  setShowOnboardingStats: (showOnboardingStats) => set({ showOnboardingStats }),
  introPhase: "idle",
  setIntroPhase: (introPhase) => set({ introPhase }),
  focusIslandId: null,
  setFocusIslandId: (focusIslandId) => set({ focusIslandId }),
  focusGithubLogin: null,
  setFocusGithubLogin: (focusGithubLogin) => set({ focusGithubLogin }),
  myTerritoryScreenPos: null,
  setMyTerritoryScreenPos: (myTerritoryScreenPos) => set({ myTerritoryScreenPos }),
  planetInteracted: false,
  setPlanetInteracted: (planetInteracted) => set({ planetInteracted }),
  cameraSettled: false,
  setCameraSettled: (cameraSettled) => set({ cameraSettled }),
  viewedGithubLogin: null,
  setViewedGithubLogin: (viewedGithubLogin) => set({ viewedGithubLogin }),
}))
