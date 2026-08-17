import { ogChamferClip } from "../../constants"

type Props = {
  appleIconSrc: string | null
}

/* eslint-disable @next/next/no-img-element */
export function OgBrandingHeader({ appleIconSrc }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
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
        thedev.world
      </span>
    </div>
  )
}
