import { AuthHeader } from "@/features/auth/components/auth-header"
import { PlanetDeveloperGoal } from "@/features/planet/components/planet-developer-goal"
import { PlanetHome } from "@/features/planet/components/planet-home"

export default function HomePage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      <AuthHeader />
      <div className="pointer-events-none absolute left-1/2 top-4 z-40 -translate-x-1/2">
        <PlanetDeveloperGoal />
      </div>
      <PlanetHome />
    </div>
  )
}
