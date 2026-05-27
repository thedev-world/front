"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { meQueryKey } from "@/features/auth/api/use-me";
import type { MeProfile } from "@/features/auth/types/me";

async function completeOnboarding(): Promise<MeProfile> {
  const res = await apiFetch("/api/v1/me/onboarding", { method: "POST" });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json() as Promise<MeProfile>;
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(meQueryKey, data);
    },
  });
}
