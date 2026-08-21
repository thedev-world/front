"use client";

import { useQuery } from "@tanstack/react-query";
import type { MeProfile } from "@/features/auth/types/me";
import {
  GitHubReauthRequiredError,
  readApiErrorDetail,
  GITHUB_REAUTH_REQUIRED_DETAIL,
} from "@/features/auth/lib/github-oauth";
import { apiFetch } from "@/lib/api-client";

export const meQueryKey = ["me"] as const;

async function loadMe(): Promise<MeProfile | null> {
  const res = await apiFetch("/api/v1/me", { passThrough401: true });
  if (res.status === 401) {
    const detail = await readApiErrorDetail(res);
    if (detail === GITHUB_REAUTH_REQUIRED_DETAIL) {
      throw new GitHubReauthRequiredError();
    }
    return null;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim() || `HTTP error ${res.status}`);
  }
  return res.json() as Promise<MeProfile>;
}

export { GitHubReauthRequiredError };

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: loadMe,
    retry: false,
    refetchOnWindowFocus: true,
  });
}
