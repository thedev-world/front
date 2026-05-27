"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { meQueryKey } from "@/features/auth/api/use-me";
import type { MeProfile } from "@/features/auth/types/me";

async function updateIsland(island: string): Promise<MeProfile> {
  const res = await apiFetch("/api/v1/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ island }),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json() as Promise<MeProfile>;
}

export function useUpdateIsland() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIsland,
    onSuccess: (data) => {
      queryClient.setQueryData(meQueryKey, data);
    },
  });
}
