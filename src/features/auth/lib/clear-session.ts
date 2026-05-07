import { postLogout } from "@/features/auth/api/post-logout";

let pendingBroadcast: Promise<void> | null = null;
let onUnauthorized: (() => void | Promise<void>) | null = null;

export function registerUnauthorizedHandler(
  handler: (() => void | Promise<void>) | null,
): void {
  onUnauthorized = handler;
}

export async function broadcastUnauthorizedReaction(): Promise<void> {
  if (!pendingBroadcast) {
    pendingBroadcast = (async () => {
      try {
        await onUnauthorized?.();
        await postLogout();
      } finally {
        pendingBroadcast = null;
      }
    })();
  }
  return pendingBroadcast;
}
