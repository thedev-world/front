// Satori-compatible inline SVG icons.

const STROKE = "rgba(255,255,255,0.5)"

type IconProps = { size?: number }

export function OgIconPerson({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" fill={STROKE} />
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function OgIconHex({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L13.5 4.75V11.25L8 14.5L2.5 11.25V4.75L8 1.5Z" stroke={STROKE} strokeWidth="1.5" />
    </svg>
  )
}

export function OgIconIsland({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M5.5 5.5L8 3l2.5 2.5" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3v6" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 13c1.5-2 3.5-3 6-3s4.5 1 6 3" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function OgIconCommit({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke={STROKE} strokeWidth="1.5" />
      <path d="M8 2.5v3M8 10.5v3" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function OgIconPullRequest({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="4.5" cy="4.5" r="2" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="4.5" cy="11.5" r="2" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="11.5" cy="11.5" r="2" stroke={STROKE} strokeWidth="1.5" />
      <path d="M4.5 6.5v3M6.5 11.5h3" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function OgIconReview({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 3h11v7H6l-3.5 3V3z" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function OgIconLock({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1" stroke={STROKE} strokeWidth="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function OgIconStar({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2 4.4 13.1l.7-4L2.2 6.3l4-.6L8 2z" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function OgIconUsers({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5.5" r="2.2" stroke={STROKE} strokeWidth="1.5" />
      <path d="M1.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11.5" cy="6" r="1.8" stroke={STROKE} strokeWidth="1.5" />
      <path d="M14.5 13.5c0-1.8-1.3-3.2-3-3.5" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function OgIconBox({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 5.5L8 2.5l5.5 3v5L8 14.5l-5.5-3v-5z" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 8v6.5M2.5 5.5L8 8l5.5-2.5" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
