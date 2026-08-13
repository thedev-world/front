type Props = {
  percent: number
  level: number
  width?: number
}

const XP_FILL = "linear-gradient(90deg, #7c5ce0 0%, #a878f0 60%, #c4a0f8 100%)"

export function OgXpBar({ percent, level, width = 176 }: Props) {
  const clamped = Math.max(0, Math.min(100, percent))
  const fillW = Math.round((clamped / 100) * width)

  return (
    <div style={{ display: "flex", flexDirection: "column", width, marginTop: 10 }}>
      <div
        style={{
          display: "flex",
          width,
          height: 7,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", width: fillW, height: 7, background: XP_FILL }} />
      </div>
      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 6, fontFamily: "Geist", fontWeight: 700 }}>
        {Math.round(clamped)}% to lvl {level + 1}
      </span>
    </div>
  )
}
