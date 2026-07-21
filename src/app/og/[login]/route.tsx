import { ImageResponse } from "next/og"

import { buildOgImageProps } from "@/features/og/api/build-og-image-props"
import { OgCard } from "@/features/og/components/og-card"
import { OG_CARD_HEIGHT, OG_CARD_WIDTH } from "@/features/og/constants"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ login: string }> },
) {
  const { login } = await params
  const result = await buildOgImageProps(login)

  if (!result.ok) {
    return new Response(result.message, { status: result.status })
  }

  return new ImageResponse(<OgCard {...result.props} />, {
    width: OG_CARD_WIDTH,
    height: OG_CARD_HEIGHT,
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
    },
  })
}
