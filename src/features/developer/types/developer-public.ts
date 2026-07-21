import type { DeveloperPreview } from "./developer-preview"

export type DeveloperPublicProfile = DeveloperPreview & {
  island: string | null
  cell_count: number
}
