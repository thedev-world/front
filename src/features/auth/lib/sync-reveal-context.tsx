"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { SyncProgress } from "../types/sync";

type SyncRevealContextValue = {
  pendingProgress: SyncProgress | null;
  setPendingProgress: (progress: SyncProgress) => void;
  clearProgress: () => void;
};

const SyncRevealContext = createContext<SyncRevealContextValue | null>(null);

export function SyncRevealProvider({ children }: { children: React.ReactNode }) {
  const [pendingProgress, setPendingProgressState] = useState<SyncProgress | null>(null);

  const setPendingProgress = useCallback((progress: SyncProgress) => {
    setPendingProgressState(progress);
  }, []);

  const clearProgress = useCallback(() => {
    setPendingProgressState(null);
  }, []);

  const value = useMemo(
    () => ({ pendingProgress, setPendingProgress, clearProgress }),
    [pendingProgress, setPendingProgress, clearProgress],
  );

  return <SyncRevealContext value={value}>{children}</SyncRevealContext>;
}

export function useSyncReveal(): SyncRevealContextValue {
  const ctx = useContext(SyncRevealContext);
  if (!ctx) throw new Error("useSyncReveal must be used within SyncRevealProvider");
  return ctx;
}
