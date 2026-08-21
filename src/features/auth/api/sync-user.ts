import { apiFetch } from "@/lib/api-client";
import {
  assertOkOrThrowAuthError,
  GitHubReauthRequiredError,
} from "@/features/auth/lib/github-oauth";
import type { MeSyncResponse } from "../types/sync";

export { GitHubReauthRequiredError };

/**
 * Trigger a synchronization of the user's data (GitHub profile, stats, etc.)
 * from the backend.
 */
export async function syncUser(): Promise<MeSyncResponse> {
  const res = await apiFetch("/api/v1/me/sync", {
    method: "POST",
    passThrough401: true,
  });

  await assertOkOrThrowAuthError(res);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim() || `HTTP error ${res.status}`);
  }

  return res.json() as Promise<MeSyncResponse>;
}
