"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

const SWEEP_DURATION = 10.0
const TEXT_START_X = 60
const TEXT_END_X = 60
const TEXT_BEHIND_DIST = 12
const TEXT_Y_TOP = 3
const TEXT_Y_BOTTOM = -3

function createTextTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  canvas.width = 2048
  canvas.height = 256
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = "bold 150px system-ui, -apple-system, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.strokeStyle = "rgba(220, 220, 220, 0.65)"
  ctx.lineWidth = 2.5
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Two billboard planes with text sweeping in opposite directions.
 * Always faces camera. Positioned behind the planet along the camera→origin axis.
 */
export function IntroTextSweep() {
  const groupRef = useRef<THREE.Group>(null)
  const topRef = useRef<THREE.Mesh>(null)
  const bottomRef = useRef<THREE.Mesh>(null)
  const startTimeRef = useRef<number | null>(null)

  const [topTex, bottomTex] = useMemo(() => {
    return [createTextTexture("EVERY COMMIT"), createTextTexture("SHAPES THE WORLD")]
  }, [])

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return

    if (startTimeRef.current === null) {
      startTimeRef.current = clock.getElapsedTime()
    }

    // Position the group behind the planet relative to camera
    const camDir = camera.position.clone().normalize()
    groupRef.current.position.copy(camDir.multiplyScalar(-TEXT_BEHIND_DIST))
    // Always face the camera (billboard)
    groupRef.current.quaternion.copy(camera.quaternion)

    const elapsed = clock.getElapsedTime() - startTimeRef.current
    const t = Math.min(elapsed / SWEEP_DURATION, 1)
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    if (topRef.current) {
      topRef.current.position.x = -TEXT_START_X + (TEXT_START_X + TEXT_END_X) * eased
    }

    if (bottomRef.current) {
      bottomRef.current.position.x = TEXT_START_X - (TEXT_START_X + TEXT_END_X) * eased
    }

    const opacity = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1
    if (topRef.current) {
      const mat = topRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    }
    if (bottomRef.current) {
      const mat = bottomRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    }
  })

  const planeWidth = 40
  const planeHeight = 5

  return (
    <group ref={groupRef}>
      <mesh ref={topRef} position={[-TEXT_START_X, TEXT_Y_TOP, 0]} renderOrder={1}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial
          map={topTex}
          transparent
          opacity={0}
          depthTest
          depthWrite={false}
        />
      </mesh>
      <mesh ref={bottomRef} position={[TEXT_START_X, TEXT_Y_BOTTOM, 0]} renderOrder={1}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial
          map={bottomTex}
          transparent
          opacity={0}
          depthTest
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
