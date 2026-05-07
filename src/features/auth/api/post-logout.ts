import { apiFetch } from "@/lib/api-client";

export async function postLogout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", { method: "POST" });
}
