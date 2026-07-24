import { useQuery } from "@tanstack/react-query"

import {
  DeveloperNotFoundError,
  developerQueryKey,
  fetchPublicDeveloper,
} from "@/features/developer/api/public-developer"

export {
  DeveloperNotFoundError,
  developerQueryKey as developerProfileQueryKey,
} from "@/features/developer/api/public-developer"

export function useDeveloperProfile(login: string | null) {
  return useQuery({
    queryKey: developerQueryKey(login ?? ""),
    queryFn: () => fetchPublicDeveloper(login!),
    enabled: !!login,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (count, error) =>
      !(error instanceof DeveloperNotFoundError) && count < 2,
  })
}
