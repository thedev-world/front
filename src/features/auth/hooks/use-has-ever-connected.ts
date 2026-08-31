"use client"

import { useSyncExternalStore } from "react"

import {
  getEverConnectedServerSnapshot,
  getEverConnectedSnapshot,
  subscribeEverConnected,
} from "@/features/auth/lib/returning-user-storage"

export function useHasEverConnected(): boolean {
  return useSyncExternalStore(
    subscribeEverConnected,
    getEverConnectedSnapshot,
    getEverConnectedServerSnapshot,
  )
}
