"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { meQueryKey } from "@/features/auth/api/use-me";
import type { MeProfile } from "@/features/auth/types/me";
import { buildSnapshotWithoutUser } from "@/features/planet/lib/planet-me";
import type { PlanetSnapshot } from "@/features/planet/types/snapshot";
import { apiFetch } from "@/lib/api-client";

async function deleteAccount(): Promise<void> {
  const res = await apiFetch("/api/v1/me", { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim() || `HTTP error ${res.status}`);
  }
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      const me = queryClient.getQueryData<MeProfile | null>(meQueryKey);
      const login = me?.github_login;

      if (login) {
        queryClient.setQueriesData<PlanetSnapshot>(
          { queryKey: ["planet-data"] },
          (snapshot) =>
            snapshot ? buildSnapshotWithoutUser(snapshot, login) : snapshot,
        );
      }

      queryClient.setQueryData(meQueryKey, null);
      router.push("/");
    },
  });
}
