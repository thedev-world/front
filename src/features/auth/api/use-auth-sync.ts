"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe, meQueryKey } from "./use-me";
import { syncUser, GitHubReauthRequiredError } from "./sync-user";
import { redirectToGitHubOAuth } from "../lib/github-oauth";
import { useSyncReveal } from "../lib/sync-reveal-context";

const SYNC_THROTTLE_MS = 30000; // 30 seconds

/**
 * Hook that manages the automatic synchronization of user data.
 * It triggers a sync on mount and when the tab becomes visible again,
 * but only if the user is authenticated, the last sync was more than 30s ago,
 * and the server-side cooldown (retry_after) has elapsed.
 * When a meaningful XP diff is detected, it queues a rank reveal animation.
 */
export function useAuthSync() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const lastSyncTime = useRef<number>(0);
  const retryAfter = useRef<number>(0); // timestamp ms from server cooldown
  const { setPendingProgress } = useSyncReveal();

  const performSync = useCallback(async () => {
    if (!me) return;

    const now = Date.now();
    if (now - lastSyncTime.current < SYNC_THROTTLE_MS) return;
    if (now < retryAfter.current) return;

    lastSyncTime.current = now;

    try {
      const result = await syncUser();

      if (!result.sync_performed) {
        // Store the server cooldown so we don't hammer the API
        if (result.cooldown_active && result.retry_after) {
          retryAfter.current = new Date(result.retry_after).getTime();
        }
        return;
      }

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
      if (err instanceof GitHubReauthRequiredError) {
        redirectToGitHubOAuth({
          returnTo: `${window.location.pathname}${window.location.search}`,
          promptConsent: true,
        });
        return;
      }
      console.error("Background sync failed:", err);
    }
  }, [me, queryClient, setPendingProgress]);

  // Sync on mount or when authentication state changes
  useEffect(() => {
    if (me) {
      performSync();
    } else {
      lastSyncTime.current = 0;
      retryAfter.current = 0;
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
