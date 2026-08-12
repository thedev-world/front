import type { ReactNode } from "react";

import { HudFrame } from "@/components/ui/hud-frame";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { DeveloperProfileOverlay } from "@/features/developer-profile/components/developer-profile-overlay";
import { LegalInfoDock } from "@/features/legal/components/legal-info-dock";
import { NetworkDock } from "@/features/network-dock/components/network-dock";
import { PlanetCanvasWrapper } from "@/features/planet/components/planet-canvas-wrapper";
import { PlanetDeveloperGoal } from "@/features/planet/components/planet-developer-goal";
import { PlanetLeaderboard } from "@/features/planet/components/planet-leaderboard";

/**
 * Shared shell on pages. The canvas + HUD live here so navigating
 * between routes never remounts the scene.
 */
export default function PlanetLayout({ children }: { children: ReactNode }) {
  return (
    <HudFrame>
      <PlanetDeveloperGoal />
      <AuthHeader />
      <PlanetLeaderboard />
      <PlanetCanvasWrapper />
      <NetworkDock />
      <LegalInfoDock />
      <DeveloperProfileOverlay />
      {children}
    </HudFrame>
  );
}
