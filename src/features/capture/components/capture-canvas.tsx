"use client"

import { Canvas } from "@react-three/fiber"
import * as THREE from "three"

import { CaptureReadySignal } from "./capture-ready-signal"
import { CaptureScene } from "./capture-scene"

type Props = {
  targetLogin: string
}

export function CaptureCanvas({ targetLogin }: Props) {
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
        <CaptureScene targetLogin={targetLogin} />
      </Canvas>
      <CaptureReadySignal />
    </div>
  )
}
