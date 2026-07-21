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
        height: 48,
        background: "rgba(169,159,224,0.22)",
        marginLeft: 32,
        marginRight: 32,
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
        <span style={{ color: "#ffffff", fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{value}</span>
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginTop: 5,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
