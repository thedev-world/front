// Satori-compatible OG card for user profiles — stats-first, no planet capture.

import type { ReactNode } from "react"

import { HUD_BORDER_GRADIENT, OG_CARD_HEIGHT, OG_CARD_WIDTH } from "../constants"
import { formatOgNumber } from "../lib/format-number"
import type { OgCardData, OgGithubStat, OgImageProps } from "../types"
import { OgBrandingHeader } from "./shared/og-branding-header"
import {
  OgIconCommit,
  OgIconLock,
  OgIconPullRequest,
  OgIconReview,
  OgIconStar,
} from "./shared/og-icons"

const PAD = 44
const TILE_GAP = 10

const HEADER_H = 46
const HEADER_GAP = 24
const FOOTER_H = 46
const STATS_H = OG_CARD_HEIGHT - PAD * 2 - HEADER_H - HEADER_GAP - FOOTER_H

const STAT_BORDER = "rgba(255,255,255,0.07)"
const STAT_BG = "rgba(255,255,255,0.02)"
const LABEL_COLOR = "rgba(255,255,255,0.38)"
const VALUE_COLOR = "rgba(255,255,255,0.9)"
const STAT_ICON_SIZE = 32

function githubStatsFromData(data: OgCardData): OgGithubStat[] {
  const candidates: OgGithubStat[] = [
    { value: data.commitsAlltime, label: "Commits", icon: "commit" },
    { value: data.prsContributionsAlltime, label: "PRs", icon: "pr" },
    { value: data.reviewsAlltime, label: "Reviews", icon: "review" },
    { value: data.privateContributionsAlltime, label: "PV activity", icon: "private" },
    { value: data.starsReceivedCapped, label: "Stars", icon: "star" },
  ]
  return candidates.filter((s) => s.value > 0)
}

/** Pick column count so tiles stay large — max 5 stats (commits, PRs, reviews, PV, stars). */
function gridCols(count: number): number {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  if (count === 4) return 2
  return 3 // 5 stats → 3 + 2
}

function tileWidth(cols: number): number {
  return (OG_CARD_WIDTH - PAD * 2 - TILE_GAP * (cols - 1)) / cols
}

function statIcon(type: OgGithubStat["icon"]): ReactNode {
  switch (type) {
    case "commit":  return <OgIconCommit size={STAT_ICON_SIZE} />
    case "pr":      return <OgIconPullRequest size={STAT_ICON_SIZE} />
    case "review":  return <OgIconReview size={STAT_ICON_SIZE} />
    case "private": return <OgIconLock size={STAT_ICON_SIZE} />
    case "star":    return <OgIconStar size={STAT_ICON_SIZE} />
  }
}

function StatTile({
  stat,
  height,
  width,
}: {
  stat: OgGithubStat
  height: number
  width: number
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width,
        height,
        border: `1px solid ${STAT_BORDER}`,
        background: STAT_BG,
        paddingTop: 22,
        paddingBottom: 22,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "flex", color: LABEL_COLOR }}>{statIcon(stat.icon)}</span>
        <span
          style={{
            color: LABEL_COLOR,
            fontSize: 24,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          {stat.label}
        </span>
      </div>
      <span
        style={{
          color: VALUE_COLOR,
          fontSize: 64,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "-1px",
        }}
      >
        {formatOgNumber(stat.value)}
      </span>
    </div>
  )
}

function footerText(data: OgCardData): string {
  const rankParts: string[] = []
  if (data.islandRank > 0) rankParts.push(`TOP #${data.islandRank} on ${data.islandLabel} Island`)
  if (data.globalRank > 0) rankParts.push(`TOP #${data.globalRank} globally`)
  const cellsLabel = `${formatOgNumber(data.cellCount)} cells`
  if (rankParts.length === 0) return cellsLabel
  return `${rankParts.join(" and ")} (${cellsLabel})`
}

export function OgCard({ data, appleIconSrc }: OgImageProps) {
  const githubStats = githubStatsFromData(data)
  const cols = gridCols(githubStats.length)
  const tileW = tileWidth(cols)
  const numRows = Math.ceil(githubStats.length / cols)
  const tileH = numRows > 0
    ? Math.floor((STATS_H - TILE_GAP * (numRows - 1)) / numRows)
    : STATS_H

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: OG_CARD_WIDTH,
        height: OG_CARD_HEIGHT,
        background: "#0d1117",
        position: "relative",
        fontFamily: "Geist",
        overflow: "hidden",
        paddingTop: PAD,
        paddingBottom: PAD,
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: HEADER_H,
          position: "relative",
          zIndex: 1,
        }}
      >
        <OgBrandingHeader appleIconSrc={appleIconSrc} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#ffffff", fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
            @{data.login}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 15,
              fontWeight: 600,
              marginTop: 5,
              letterSpacing: "0.3px",
            }}
          >
            {data.className} on {data.islandLabel} Island
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 1,
          marginTop: HEADER_GAP,
          gap: TILE_GAP,
        }}
      >
        {githubStats.map((stat) => (
          <StatTile key={stat.label} stat={stat} height={tileH} width={tileW} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          height: FOOTER_H,
          borderTop: `1px solid ${STAT_BORDER}`,
          marginTop: "auto",
        }}
      >
        <span
          style={{
            background: HUD_BORDER_GRADIENT,
            backgroundClip: "text",
            color: "transparent",
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: "0.3px",
            marginTop: 42,
          }}
        >
          {footerText(data)}
        </span>
      </div>
    </div>
  )
}
