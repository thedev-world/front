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

      sizes[i] = 0.3 + rand() * 0.8

      const warmth = rand()
      colors[i * 3] = 0.85 + warmth * 0.15
      colors[i * 3 + 1] = 0.88 + warmth * 0.12
      colors[i * 3 + 2] = 0.95 + (1 - warmth) * 0.05
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
        size={0.15}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}
