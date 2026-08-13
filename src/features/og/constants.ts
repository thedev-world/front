export const OG_CARD_WIDTH = 1200
export const OG_CARD_HEIGHT = 630

export const HUD_BORDER_GRADIENT =
  "linear-gradient(155deg, #e3e1f8 0%, #a9b7fe 42%, #cbcbf7 100%)"
export const HUD_PANEL_FILL =
  "linear-gradient(165deg, rgba(26,23,40,0.97) 0%, rgba(15,13,28,0.97) 52%, rgba(8,7,26,0.99) 100%)"

export const OG_PANEL_MARGIN = 28
export const OG_PANEL_W = OG_CARD_WIDTH - OG_PANEL_MARGIN * 2
export const OG_PANEL_H = 168
export const OG_PANEL_PAD_Y = 24
export const OG_PANEL_PAD_X = 30
export const OG_CHAMFER = 14

/** Chamfered octagon, same shape as --hud-readout-clip. Fixed px only (Satori breaks calc()). */
export function ogChamferClip(w: number, h: number, c: number): string {
  return `polygon(0px ${c}px, ${c}px 0px, ${w - c}px 0px, ${w}px ${c}px, ${w}px ${h - c}px, ${w - c}px ${h}px, ${c}px ${h}px, 0px ${h - c}px)`
}
