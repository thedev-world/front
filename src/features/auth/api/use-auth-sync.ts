"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe, meQueryKey } from "./use-me";
import { syncUser, GitHubReauthRequiredError } from "./sync-user";
import { redirectToGitHubOAuth } from "../lib/github-oauth";
import { useSyncReveal } from "../lib/sync-reveal-context";

const SYNC_THROTTLE_MS = 30000; // 30 seconds

/**
 * Automatic GitHub score sync on mount and tab focus.
 * Exposes waitForSync() so onboarding can await the first sync before completing.
 */
export function useAuthSync() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const lastSyncTime = useRef<number>(0);
  const retryAfter = useRef<number>(0);
  const syncInFlightRef = useRef<Promise<void> | null>(null);
  const { setPendingProgress } = useSyncReveal();

  const runSync = useCallback(
    async ({
      bypassThrottle = false,
      invalidateOnCooldown = false,
    }: { bypassThrottle?: boolean; invalidateOnCooldown?: boolean } = {}) => {
      if (!me) return;

      const now = Date.now();
      if (!bypassThrottle) {
        if (now - lastSyncTime.current < SYNC_THROTTLE_MS) return;
        if (now < retryAfter.current) return;
      }

      lastSyncTime.current = now;

      const result = await syncUser();

      if (!result.sync_performed) {
        if (result.cooldown_active && result.retry_after) {
          retryAfter.current = new Date(result.retry_after).getTime();
        }
        if (invalidateOnCooldown) {
          await queryClient.invalidateQueries({ queryKey: meQueryKey, exact: true });
        }
        return;
      }

      await queryClient.invalidateQueries({ queryKey: meQueryKey, exact: true });

      if (
        !result.first_sync &&
        result.progress !== null &&
        result.progress.xp_after > result.progress.xp_before
      ) {
        setPendingProgress(result.progress);
      }
    },
    [me, queryClient, setPendingProgress],
  );

  const performSync = useCallback(async () => {
    if (syncInFlightRef.current) {
      return syncInFlightRef.current;
    }

    const task = (async () => {
      try {
        await runSync();
      } catch (err) {
        if (err instanceof GitHubReauthRequiredError) {
          redirectToGitHubOAuth({
            returnTo: `${window.location.pathname}${window.location.search}`,
            promptConsent: true,
          });
          return;
        }
        console.error("Background sync failed:", err);
        throw err;
      }
    })();

    syncInFlightRef.current = task.finally(() => {
      syncInFlightRef.current = null;
    });

    return syncInFlightRef.current;
  }, [runSync]);

  const waitForSync = useCallback(async () => {
    if (me?.last_sync_at) return;

    if (syncInFlightRef.current) {
      await syncInFlightRef.current;
      return;
    }

    const task = (async () => {
      try {
        await runSync({ bypassThrottle: true, invalidateOnCooldown: true });
      } catch (err) {
        if (err instanceof GitHubReauthRequiredError) {
          redirectToGitHubOAuth({
            returnTo: `${window.location.pathname}${window.location.search}`,
            promptConsent: true,
          });
          return;
        }
        console.error("Onboarding sync failed:", err);
        throw err;
      }
    })();

    syncInFlightRef.current = task.finally(() => {
      syncInFlightRef.current = null;
    });

    await syncInFlightRef.current;
  }, [me, runSync]);

  useEffect(() => {
    if (me) {
      void performSync();
    } else {
      lastSyncTime.current = 0;
      retryAfter.current = 0;
    }
  }, [me, performSync]);

  useEffect(() => {
    const handleFocus = () => {
      if (me) void performSync();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [me, performSync]);

  return { waitForSync };
}
