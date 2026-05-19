"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe, meQueryKey } from "./use-me";
import { syncUser } from "./sync-user";

const SYNC_THROTTLE_MS = 30000; // 30 seconds

/**
 * Hook that manages the automatic synchronization of user data.
 * It triggers a sync on mount and when the window gains focus,
 * but only if the user is authenticated and the last sync was more than 30s ago.
 */
export function useAuthSync() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const lastSyncTime = useRef<number>(0);

  const performSync = useCallback(async () => {
    if (!me) return;

    const now = Date.now();
    if (now - lastSyncTime.current < SYNC_THROTTLE_MS) {
      return;
    }

    lastSyncTime.current = now;

    try {
      const result = await syncUser();
      
      // Only invalidate if the backend actually performed a sync
      if (result.sync_performed) {
        queryClient.invalidateQueries({ queryKey: meQueryKey, exact: true });
      }
    } catch (err) {
      console.error("Background sync failed:", err);
    }
  }, [me, queryClient]);

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
