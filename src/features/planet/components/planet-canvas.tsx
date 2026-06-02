"use client"

import { Canvas } from "@react-three/fiber"
import * as THREE from "three"

import { PlanetScene } from "./planet-scene"
import { TerritoryHoverCard } from "./territory-hover-card"

export function PlanetCanvas() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 5, 16], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <PlanetScene />
      </Canvas>
      <TerritoryHoverCard />
    </div>
  )
}
