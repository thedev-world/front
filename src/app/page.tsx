import { AuthHeader } from "@/features/auth/components/auth-header"
import { PlanetHome } from "@/features/planet/components/planet-home"

export default function HomePage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      <AuthHeader />
      <PlanetHome />
    </div>
  )
}
