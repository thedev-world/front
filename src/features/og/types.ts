export type OgCardData = {
  login: string
  avatarUrl: string | null
  islandLabel: string
  level: number
  cellCount: number
  className: string
  islandRank: number
  globalRank: number
  commitsAlltime: number
  prsContributionsAlltime: number
  reviewsAlltime: number
  privateContributionsAlltime: number
  starsReceivedCapped: number
}

export type OgImageProps = {
  data: OgCardData
  appleIconSrc: string | null
}

export type OgGithubStat = {
  value: number
  label: string
  icon: "commit" | "pr" | "review" | "private" | "star"
}
