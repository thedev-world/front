"use client"

import { OrbitControls } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

import { usePlanetData } from "../api/use-planet-data"

import { IslandLabels } from "./island-labels"
import { IslandTerritories } from "./island-territories"
import { OceanPlanet } from "./ocean-planet"
import { StarField } from "./star-field"

function PlanetGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.015
  })
  return <group ref={ref}>{children}</group>
}

export function PlanetScene() {
  const { data: snapshot } = usePlanetData()

  return (
    <>
      {/* Cinematic 3-point lighting */}
      <ambientLight intensity={0.8} color="#c8ddf5" />
      <directionalLight position={[8, 5, 4]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-6, 2, -5]} intensity={0.6} color="#d0eeff" />
      <directionalLight position={[0, -6, 6]} intensity={0.4} color="#e8f4ff" />

      {/* Subtle rim light from behind for atmosphere edge glow */}
      <pointLight position={[0, 0, -15]} intensity={0.3} color="#38bdf8" />

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={30}
        zoomSpeed={0.5}
        rotateSpeed={0.4}
        dampingFactor={0.08}
        enableDamping
        makeDefault
      />

      <StarField />

      <PlanetGroup>
        <OceanPlanet />
        {snapshot && (
          <>
            <IslandTerritories key={snapshot.version} snapshot={snapshot} />
            <IslandLabels islands={snapshot.islands} />
          </>
        )}
      </PlanetGroup>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.7}
          intensity={0.4}
          radius={0.7}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}
