// Satori-compatible component: no Tailwind, no next/image, inline styles only.
import {
  OG_CARD_HEIGHT,
  OG_CARD_WIDTH,
  ogChamferClip,
} from "../constants"
import type { OgHomeImageProps } from "../api/build-og-home-image-props"

const PURPLE = "#a878f0"
const PAD = 56
const GOAL_BAND_H = 72
const PLANET_SIZE = 620
const LEFT_W = 800

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

// Minimal inline SVG icons, Satori supports native <svg> elements
function IconPerson() {
  return (
    <svg width="48" height="48" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" fill="rgba(255,255,255,0.5)" />
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconHex() {
  return (
    <svg width="48" height="48" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L13.5 4.75V11.25L8 14.5L2.5 11.25V4.75L8 1.5Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    </svg>
  )
}

function IconIsland() {
  return (
    <svg width="48" height="48" viewBox="0 0 16 16" fill="none">
      <path d="M5.5 5.5L8 3l2.5 2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3v6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 13c1.5-2 3.5-3 6-3s4.5 1 6 3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

type StatProps = { value: string; label: string; icon: React.ReactNode }

function Stat({ value, label, icon }: StatProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {icon}
      <span style={{ color: "#ffffff", fontSize: 64, fontWeight: 700, lineHeight: 1, marginTop: 8 }}>
        {value}
      </span>
      <span
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 22,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginTop: 6,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function StatDivider() {
  return (
    <div
      style={{
        display: "flex",
        width: 1,
        height: 56,
        background: "rgba(169,159,224,0.2)",
        marginLeft: 32,
        marginRight: 32,
      }}
    />
  )
}

/* eslint-disable @next/next/no-img-element */
export function OgHomeCard({
  totalDevs,
  totalCells,
  islandCount,
  planetImageSrc,
  appleIconSrc,
}: OgHomeImageProps) {
  const contentH = OG_CARD_HEIGHT - GOAL_BAND_H

  return (
    <div
      style={{
        display: "flex",
        width: OG_CARD_WIDTH,
        height: OG_CARD_HEIGHT,
        background: "#000",
        position: "relative",
        fontFamily: "Geist",
        overflow: "hidden",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: -120,
          right: -120,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,72,200,0.22) 0%, rgba(8,6,15,0) 68%)",
        }}
      />

      {/* Planet */}
      {planetImageSrc !== null && (
        <img
          src={planetImageSrc}
          alt="Developer planet"
          width={PLANET_SIZE}
          height={PLANET_SIZE}
          style={{
            position: "absolute",
            right: 0,
            top: (contentH - PLANET_SIZE) / 6,
          }}
        />
      )}

      {/* Left content column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: 0,
          left: 0,
          width: LEFT_W,
          height: contentH,
          paddingTop: PAD,
          paddingBottom: PAD,
          paddingLeft: PAD,
          paddingRight: 40,
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          {appleIconSrc !== null && (
            <img
              src={appleIconSrc}
              alt="logo"
              width={40}
              height={40}
              style={{ clipPath: ogChamferClip(40, 40, 6), marginRight: 14 }}
            />
          )}
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "2.8px",
              textTransform: "uppercase",
            }}
          >
            The Dev World
          </span>
        </div>

        {/* Title + description */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ color: "#ffffff", fontSize: 68, fontWeight: 700, letterSpacing: "-1px" }}>
              The world for
            </span>
            <span style={{ color: PURPLE, fontSize: 68, fontWeight: 700, letterSpacing: "-1px" }}>
              developers.
            </span>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 28,
              lineHeight: 1.5,
              marginTop: 18,
              maxWidth: 600,
            }}
          >
            Explore the map, claim cells by contributing on GitHub, and see where you rank.
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 32 }}>
          <Stat value={formatNumber(totalDevs)} label="Developers" icon={<IconPerson />} />
          <StatDivider />
          <Stat value={formatNumber(totalCells)} label="Cells claimed" icon={<IconHex />} />
          <StatDivider />
          <Stat value={String(islandCount)} label="Islands" icon={<IconIsland />} />
        </div>
      </div>
    </div>
  )
}
