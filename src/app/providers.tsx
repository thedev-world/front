"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { meQueryKey } from "@/features/auth/api/use-me";
import {
  broadcastUnauthorizedReaction,
  registerUnauthorizedHandler,
} from "@/features/auth/lib/clear-session";
import { setUnauthorizedBroadcastHandler } from "@/lib/api-client";
import { makeQueryClient } from "@/lib/query-client";
import { useAuthSync } from "@/features/auth/api/use-auth-sync";
import { useGitHubReauthRedirect } from "@/features/auth/hooks/use-github-reauth-redirect";
import { SyncRevealProvider } from "@/features/auth/lib/sync-reveal-context";
import { SyncRevealDialog } from "@/features/onboarding/components/sync-reveal-dialog";

function AuthSyncManager() {
  useAuthSync();
  useGitHubReauthRedirect();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      queryClient.setQueryData(meQueryKey, null);
    });
    setUnauthorizedBroadcastHandler(broadcastUnauthorizedReaction);
    return () => {
      registerUnauthorizedHandler(null);
      setUnauthorizedBroadcastHandler(null);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <SyncRevealProvider>
        <AuthSyncManager />
        <SyncRevealDialog />
        {children}
      </SyncRevealProvider>
    </QueryClientProvider>
  );
}
