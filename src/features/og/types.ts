export type OgCardData = {
  login: string
  avatarUrl: string | null
  islandLabel: string
  level: number
  xpPercent: number
  cellCount: number
  className: string
  islandRank: number
  globalRank: number
}

export type OgImageProps = {
  data: OgCardData
  planetImageSrc: string | null
}
