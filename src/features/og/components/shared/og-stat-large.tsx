import type { ReactNode } from "react"

type StatProps = {
  value: string
  label: string
  icon: ReactNode
  valueSize?: number
  labelSize?: number
}

export function OgStatLarge({
  value,
  label,
  icon,
  valueSize = 64,
  labelSize = 22,
}: StatProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {icon}
      <span
        style={{
          color: "#ffffff",
          fontSize: valueSize,
          fontWeight: 700,
          lineHeight: 1,
          marginTop: 8,
        }}
      >
        {value}
      </span>
      <span
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: labelSize,
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

export function OgStatDivider({ height = 56 }: { height?: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: 1,
        height,
        background: "rgba(169,159,224,0.2)",
        marginLeft: 32,
        marginRight: 32,
      }}
    />
  )
}
