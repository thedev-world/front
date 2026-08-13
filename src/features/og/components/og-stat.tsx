type Props = {
  value: string | null
  label: string
  displaySeparator?: boolean
}

function Separator() {
  return (
    <div
      style={{
        display: "flex",
        width: 1,
        height: 64,
        background: "rgba(169,159,224,0.22)",
        marginLeft: 36,
        marginRight: 36,
      }}
    />
  )
}

export function OgStat({ value, label, displaySeparator = true }: Props) {
  if (value === null) return null

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {displaySeparator ? <Separator /> : null}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span
          style={{
            color: "#ffffff",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "Geist",
          }}
        >
          {value}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 32,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.6px",
            marginTop: 8,
            fontFamily: "Geist",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
