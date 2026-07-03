"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const STAR_COUNT = 1500
const STAR_RADIUS = 80

export function StarField() {
  const ref = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)
    const colors = new Float32Array(STAR_COUNT * 3)

    let seed = 42
    const rand = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return (seed - 1) / 2147483646
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      const phi = Math.acos(2 * rand() - 1)
      const theta = rand() * Math.PI * 2
      const r = STAR_RADIUS + rand() * 20

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      sizes[i] = 0.35 + rand() * 1.1

      // Blue-violet palette: cool blue-white, violet, deep indigo accents
      const t = rand()
      if (t < 0.55) {
        // Cool blue-white
        const b = rand()
        colors[i * 3]     = 0.62 + b * 0.22  // R
        colors[i * 3 + 1] = 0.68 + b * 0.20  // G
        colors[i * 3 + 2] = 0.95 + b * 0.05  // B
      } else if (t < 0.82) {
        // Violet / indigo
        const v = rand()
        colors[i * 3]     = 0.60 + v * 0.28  // R
        colors[i * 3 + 1] = 0.45 + v * 0.20  // G
        colors[i * 3 + 2] = 0.90 + v * 0.10  // B
      } else {
        // Bright near-white with blue tint
        colors[i * 3]     = 0.88
        colors[i * 3 + 1] = 0.90
        colors[i * 3 + 2] = 1.00
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  // Gentle twinkle via slow rotation
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.003
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.002) * 0.01
    }
  })

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        vertexColors
        size={0.18}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  )
}
