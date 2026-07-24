import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  developerQueryKey,
  fetchPublicDeveloper,
} from "@/features/developer/api/public-developer"
import { useDebounce } from "@/hooks/use-debounce"

/**
 * Debounced public-developer fetch for territory hover.
 */
export function useDeveloperPreview(githubLogin: string | null) {
  const queryClient = useQueryClient()
  const isCached =
    !!githubLogin &&
    !!queryClient.getQueryData(developerQueryKey(githubLogin))
  const debouncedGithubLogin = useDebounce(githubLogin, 300)
  const effectiveGithubLogin = isCached ? githubLogin : debouncedGithubLogin

  const query = useQuery({
    queryKey: developerQueryKey(effectiveGithubLogin ?? ""),
    queryFn: () => fetchPublicDeveloper(effectiveGithubLogin!),
    enabled: !!effectiveGithubLogin,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return {
    ...query,
    isPending: query.isLoading || effectiveGithubLogin !== githubLogin,
  }
}
