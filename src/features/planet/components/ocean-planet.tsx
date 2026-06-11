"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { PLANET_RADIUS } from "../lib/planet-projection"

const OCEAN_VERT = `
  uniform float uTime;
  varying vec3 vPos;

  void main() {
    vec3 p = position;
    float wave =
      sin(p.x * 4.0 + uTime * 0.9) * 0.006 +
      sin(p.y * 3.2 + uTime * 0.7) * 0.005 +
      sin(p.z * 5.0 + uTime * 1.1) * 0.004 +
      sin((p.x + p.z) * 2.5 + uTime * 0.5) * 0.004;
    vec3 displaced = normalize(p) * (length(p) + wave);
    vPos = displaced;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

const OCEAN_FRAG = `
  uniform vec3 uColor;
  uniform vec3 uDeep;
  uniform vec3 uLight;
  varying vec3 vPos;

  void main() {
    // Flat shading via derivatives (built-in in WebGL2, no extension needed)
    vec3 dx = dFdx(vPos);
    vec3 dy = dFdy(vPos);
    vec3 n = normalize(cross(dx, dy));

    vec3 light1 = normalize(vec3(0.8, 0.5, 0.4));
    vec3 light2 = normalize(vec3(-0.5, 0.2, -0.6));
    float diff = max(dot(n, light1), 0.0) * 0.65
               + max(dot(n, light2), 0.0) * 0.2
               + 0.22;

    // Depth tint: faces pointing "up" are lighter
    float depth = dot(normalize(vPos), vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
    vec3 col = mix(uDeep, uColor, depth);

    gl_FragColor = vec4(col * diff + uLight * 0.06, 1.0);
  }
`

const FRESNEL_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`

const FRESNEL_FRAG = `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 5.0);
    gl_FragColor = vec4(uColor, fresnel * uStrength);
  }
`

type Props = {
  planetRadius?: number
}

export function OceanPlanet({ planetRadius = PLANET_RADIUS }: Props) {
  const oceanMatRef = useRef<THREE.ShaderMaterial>(null)

  const fresnelMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FRESNEL_VERT,
        fragmentShader: FRESNEL_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color("#38bdf8") },
          uStrength: { value: 0.25 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useFrame(({ clock }) => {
    if (oceanMatRef.current) {
      oceanMatRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <group>
      {/* Animated low-poly ocean */}
      <mesh>
        <icosahedronGeometry args={[planetRadius, 4]} />
        <shaderMaterial
          ref={oceanMatRef}
          vertexShader={OCEAN_VERT}
          fragmentShader={OCEAN_FRAG}
          depthWrite
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#0ea5e9") },
            uDeep: { value: new THREE.Color("#0c4a6e") },
            uLight: { value: new THREE.Color("#7dd3fc") },
          }}
        />
      </mesh>

      {/* Fresnel atmosphere rim — renderOrder 2 so it renders after the intro text (renderOrder 1) and visually overlaps it */}
      <mesh material={fresnelMat} renderOrder={2}>
        <sphereGeometry args={[planetRadius * 1.07, 48, 48]} />
      </mesh>
    </group>
  )
}
