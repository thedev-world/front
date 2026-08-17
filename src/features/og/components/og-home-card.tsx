// Satori-compatible component: no Tailwind, no next/image, inline styles only.
import type { OgHomeImageProps } from "../api/build-og-home-image-props"
import { OG_CARD_HEIGHT, OG_CARD_WIDTH } from "../constants"
import { OgBrandingHeader } from "./shared/og-branding-header"
import { OgIconHex, OgIconIsland, OgIconPerson } from "./shared/og-icons"
import { OgRadialGlow } from "./shared/og-radial-glow"
import { OgStatDivider, OgStatLarge } from "./shared/og-stat-large"
import { formatOgNumber } from "../lib/format-number"

const PURPLE = "#a878f0"
const PAD = 56
const GOAL_BAND_H = 72
const PLANET_SIZE = 620
const LEFT_W = 800

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
      <OgRadialGlow />

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
        <OgBrandingHeader appleIconSrc={appleIconSrc} />

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

        <div style={{ display: "flex", alignItems: "center", marginTop: 32 }}>
          <OgStatLarge value={formatOgNumber(totalDevs)} label="Developers" icon={<OgIconPerson />} />
          <OgStatDivider />
          <OgStatLarge value={formatOgNumber(totalCells)} label="Cells claimed" icon={<OgIconHex />} />
          <OgStatDivider />
          <OgStatLarge value={String(islandCount)} label="Islands" icon={<OgIconIsland />} />
        </div>
      </div>
    </div>
  )
}
