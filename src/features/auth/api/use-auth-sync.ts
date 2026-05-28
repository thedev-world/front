"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe, meQueryKey } from "./use-me";
import { syncUser } from "./sync-user";
import { useSyncReveal } from "../lib/sync-reveal-context";

const SYNC_THROTTLE_MS = 30000; // 30 seconds

/**
 * Hook that manages the automatic synchronization of user data.
 * It triggers a sync on mount and when the window gains focus,
 * but only if the user is authenticated and the last sync was more than 30s ago.
 * When a meaningful XP diff is detected, it queues a rank reveal animation.
 */
export function useAuthSync() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const lastSyncTime = useRef<number>(0);
  const { setPendingProgress } = useSyncReveal();

  const performSync = useCallback(async () => {
    if (!me) return;

    const now = Date.now();
    if (now - lastSyncTime.current < SYNC_THROTTLE_MS) {
      return;
    }

    lastSyncTime.current = now;

    try {
      const result = await syncUser();

      if (!result.sync_performed) return;

      queryClient.invalidateQueries({ queryKey: meQueryKey, exact: true });

      // Trigger reveal only on incremental sync with a real XP gain
      if (
        !result.first_sync &&
        result.progress !== null &&
        result.progress.xp_after > result.progress.xp_before
      ) {
        setPendingProgress(result.progress);
      }
    } catch (err) {
      console.error("Background sync failed:", err);
    }
  }, [me, queryClient, setPendingProgress]);

  // Sync on mount or when authentication state changes
  useEffect(() => {
    if (me) {
      performSync();
    } else {
      lastSyncTime.current = 0; // Reset so it syncs immediately on next login
    }
  }, [me, performSync]);

  // Sync when user returns to the tab
  useEffect(() => {
    const handleFocus = () => {
      if (me) {
        performSync();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [me, performSync]);
}
