"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuthSync } from "@/features/auth/api/use-auth-sync";

type AuthSyncContextValue = {
  waitForSync: () => Promise<void>;
};

const AuthSyncContext = createContext<AuthSyncContextValue | null>(null);

export function AuthSyncProvider({ children }: { children: ReactNode }) {
  const { waitForSync } = useAuthSync();
  return (
    <AuthSyncContext.Provider value={{ waitForSync }}>
      {children}
    </AuthSyncContext.Provider>
  );
}

export function useWaitForSync(): () => Promise<void> {
  const ctx = useContext(AuthSyncContext);
  if (!ctx) {
    throw new Error("useWaitForSync must be used within AuthSyncProvider");
  }
  return ctx.waitForSync;
}
