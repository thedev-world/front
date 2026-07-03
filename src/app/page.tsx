import { AuthHeader } from "@/features/auth/components/auth-header";
import { PlanetDeveloperGoal } from "@/features/planet/components/planet-developer-goal";
import { PlanetCanvasWrapper } from "@/features/planet/components/planet-canvas-wrapper";
import { HudFrame } from "@/components/ui/hud-frame";
import { NetworkDock } from "@/features/network-dock/components/network-dock";
import { PlanetLeaderboard } from "@/features/planet/components/planet-leaderboard";

export default function HomePage() {
  return (
    <HudFrame>
      <PlanetDeveloperGoal />
      <AuthHeader />
      <PlanetLeaderboard />
      <PlanetCanvasWrapper />
      <NetworkDock />
    </HudFrame>
  );
}
