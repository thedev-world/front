import { useQueryClient, useQuery } from "@tanstack/react-query"

import { useDebounce } from "@/hooks/use-debounce"
import { apiFetch } from "@/lib/api-client"
import type { DeveloperPreview } from "@/features/developer/types/developer-preview"

async function fetchDeveloperPreview(githubLogin: string): Promise<DeveloperPreview> {
  const res = await apiFetch(`/api/v1/user/${githubLogin}`)
  if (!res.ok) throw new Error(`Failed to fetch developer: ${res.status}`)
  return res.json()
}

export const developerPreviewQueryKey = (githubLogin: string) =>
  ["developer-preview", githubLogin] as const

export function useDeveloperPreview(githubLogin: string | null) {
  const queryClient = useQueryClient()
  const isCached =
    !!githubLogin &&
    !!queryClient.getQueryData(developerPreviewQueryKey(githubLogin))
  const debouncedGithubLogin = useDebounce(githubLogin, 300)
  const effectiveGithubLogin = isCached ? githubLogin : debouncedGithubLogin

  const query = useQuery({
    queryKey: developerPreviewQueryKey(effectiveGithubLogin ?? ""),
    queryFn: () => fetchDeveloperPreview(effectiveGithubLogin!),
    enabled: !!effectiveGithubLogin,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return {
    ...query,
    isPending: query.isLoading || effectiveGithubLogin !== githubLogin,
  }
}
