// Card component for the Open Graph image. This is rendered by Satori (next/og) to generate the OG image.
// No tailwindcss or next/image is used here, as Satori does not support them. All styles are inline and all images are native <img> elements.

import {
  HUD_BORDER_GRADIENT,
  HUD_PANEL_FILL,
  OG_CARD_HEIGHT,
  OG_CARD_WIDTH,
  OG_CHAMFER,
  OG_PANEL_H,
  OG_PANEL_MARGIN,
  OG_PANEL_PAD_X,
  OG_PANEL_PAD_Y,
  OG_PANEL_W,
  ogChamferClip,
} from "../constants"
import type { OgImageProps } from "../types"
import { OgBranding } from "./og-branding"
import { OgStat } from "./og-stat"
import { OgXpBar } from "./og-xp-bar"

/* eslint-disable @next/next/no-img-element -- Satori (next/og ImageResponse) only supports native <img>, not next/image */
export function OgCard({ data, planetImageSrc }: OgImageProps) {
  const {
    login,
    avatarUrl,
    islandLabel,
    level,
    xpPercent,
    cellCount,
    className,
    islandRank,
    globalRank,
  } = data

  return (
    <div
      style={{
        display: "flex",
        width: OG_CARD_WIDTH,
        height: OG_CARD_HEIGHT,
        background: "#08060f",
        position: "relative",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {planetImageSrc !== null ? (
        <img
          src={planetImageSrc}
          alt="Planet capture"
          width={OG_CARD_WIDTH}
          height={OG_CARD_HEIGHT}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 0,
            left: 0,
            width: OG_CARD_WIDTH,
            height: OG_CARD_HEIGHT,
            background: "linear-gradient(160deg, #0e0d1e 0%, #08060f 55%, #0a0a1a 100%)",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 15,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Territory capture in progress...
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_CARD_WIDTH,
          height: 240,
          background:
            "linear-gradient(to bottom, rgba(8,6,15,0.88) 0%, rgba(8,6,15,0.35) 70%, transparent 100%)",
        }}
      />

      {/* HUD border layer */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: OG_PANEL_MARGIN,
          left: OG_PANEL_MARGIN,
          width: OG_PANEL_W,
          height: OG_PANEL_H,
          clipPath: ogChamferClip(OG_PANEL_W, OG_PANEL_H, OG_CHAMFER),
          background: HUD_BORDER_GRADIENT,
        }}
      />
      {/* HUD panel fill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "absolute",
          top: OG_PANEL_MARGIN + 1,
          left: OG_PANEL_MARGIN + 1,
          width: OG_PANEL_W - 2,
          height: OG_PANEL_H - 2,
          clipPath: ogChamferClip(OG_PANEL_W - 2, OG_PANEL_H - 2, OG_CHAMFER - 1),
          background: HUD_PANEL_FILL,
          paddingTop: OG_PANEL_PAD_Y,
          paddingBottom: OG_PANEL_PAD_Y,
          paddingLeft: OG_PANEL_PAD_X,
          paddingRight: OG_PANEL_PAD_X,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {avatarUrl !== null ? (
            <img
              src={avatarUrl}
              alt={`${login} avatar`}
              width={78}
              height={78}
              style={{ clipPath: ogChamferClip(78, 78, 9), marginRight: 20 }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 78,
                height: 78,
                clipPath: ogChamferClip(78, 78, 9),
                background: "rgba(169,159,224,0.2)",
                marginRight: 20,
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#ffffff", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
              @{login}
            </span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, marginTop: 6 }}>
              {className} · {islandLabel} Island
            </span>
            <OgXpBar percent={xpPercent} level={level} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <OgStat value={String(cellCount)} label="Cells" displaySeparator={false} />
          <OgStat value={islandRank > 0 ? `#${islandRank}` : null} label="Island" />
          <OgStat value={globalRank > 0 ? `#${globalRank}` : null} label="Global" />
        </div>
      </div>

      <OgBranding />
    </div>
  )
}
