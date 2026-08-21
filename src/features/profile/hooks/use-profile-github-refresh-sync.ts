"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { meQueryKey } from "@/features/auth/api/use-me";
import { syncUser } from "@/features/auth/api/sync-user";

/**
 * After GitHub OAuth refresh from the profile page, force an immediate sync so
 * newly authorized organizations are picked up without waiting for cooldown.
 */
export function useProfileGitHubRefreshSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const ranRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("github_refresh") !== "1") return;
    if (ranRef.current) return;
    ranRef.current = true;

    void (async () => {
      try {
        await syncUser();
        await queryClient.invalidateQueries({ queryKey: meQueryKey, exact: true });
      } catch (err) {
        console.error("Profile GitHub refresh sync failed:", err);
      } finally {
        router.replace("/profile", { scroll: false });
      }
    })();
  }, [queryClient, router, searchParams]);
}
