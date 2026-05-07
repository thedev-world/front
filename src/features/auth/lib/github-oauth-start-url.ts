import { resolveApiUrl } from "@/lib/api-url";

export function githubOAuthStartUrl(): string {
  return resolveApiUrl("/api/v1/auth/github/start");
}
