import { apiFetch } from "@/lib/api-client";

/**
 * Trigger a synchronization of the user's data (GitHub profile, stats, etc.)
 * from the backend.
 */
export async function syncUser(): Promise<{ sync_performed: boolean }> {
  const res = await apiFetch("/api/v1/me/sync", {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim() || `HTTP error ${res.status}`);
  }

  return res.json() as Promise<{ sync_performed: boolean }>;
}
