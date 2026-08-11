export const BREAKPOINTS = {
  hudCompact: 830,
  hudMobile: 614,
  profileCardFull: 735,
} as const

export const mediaQuery = {
  max: (px: number) => `(max-width: ${px}px)`,
  min: (px: number) => `(min-width: ${px + 1}px)`,
} as const
