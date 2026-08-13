import { ImageResponse } from "next/og"

import { buildOgHomeImageProps } from "@/features/og/api/build-og-home-image-props"
import { OgHomeCard } from "@/features/og/components/og-home-card"
import { OG_CARD_HEIGHT, OG_CARD_WIDTH } from "@/features/og/constants"
import { loadOgFonts } from "@/features/og/lib/load-og-fonts"

export const runtime = "nodejs"

export async function GET() {
  const result = await buildOgHomeImageProps()

  if (!result.ok) {
    return new Response(result.message, { status: result.status })
  }

  return new ImageResponse(<OgHomeCard {...result.props} />, {
    width: OG_CARD_WIDTH,
    height: OG_CARD_HEIGHT,
    fonts: loadOgFonts(),
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  })
}
