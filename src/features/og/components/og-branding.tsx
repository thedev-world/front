import { HUD_BORDER_GRADIENT, OG_CARD_HEIGHT, OG_CARD_WIDTH, ogChamferClip } from "../constants"

const BADGE_W = 260
const BADGE_H = 70
const CHAMFER = 8
const INSET = 1

const BADGE_TOP = OG_CARD_HEIGHT - BADGE_H - 24
const BADGE_LEFT = OG_CARD_WIDTH - BADGE_W - 24

export function OgBranding() {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: BADGE_TOP,
        left: BADGE_LEFT,
        width: BADGE_W,
        height: BADGE_H,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: BADGE_W,
          height: BADGE_H,
          clipPath: ogChamferClip(BADGE_W, BADGE_H, CHAMFER),
          background: HUD_BORDER_GRADIENT,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: INSET,
          left: INSET,
          width: BADGE_W - INSET * 2,
          height: BADGE_H - INSET * 2,
          clipPath: ogChamferClip(BADGE_W - INSET * 2, BADGE_H - INSET * 2, CHAMFER - 1),
          background: "rgba(13,11,28,0.94)",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, letterSpacing: "0.3px" }}>
          Claim your developer territory on
        </span>
        <span style={{ color: "#e3e1f8", fontSize: 17, fontWeight: 700, letterSpacing: "0.4px", marginTop: 2 }}>
          thedev.world
        </span>
      </div>
    </div>
  )
}
