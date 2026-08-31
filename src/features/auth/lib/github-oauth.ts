import { resolveApiUrl } from "@/lib/api-url";

export type GitHubOAuthStartOptions = {
  /** Absolute URL on an allowed frontend origin, e.g. https://thedev.world/profile */
  returnTo?: string;
  /** Force GitHub to show the consent screen again (needed for new org access). */
  promptConsent?: boolean;
  /** Request read:org scope to include organization admin repo stars. */
  includeOrgs?: boolean;
};

function buildReturnToUrl(path: string): string {
  if (typeof window === "undefined") {
    return path;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

export function getGitHubOAuthStartUrl(options: GitHubOAuthStartOptions = {}): string {
  const base = resolveApiUrl("/api/v1/auth/github/start");
  const params = new URLSearchParams();

  if (options.returnTo) {
    params.set("return_to", buildReturnToUrl(options.returnTo));
  }
  if (options.promptConsent) {
    params.set("prompt", "consent");
  }
  if (options.includeOrgs) {
    params.set("include_orgs", "true");
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function redirectToGitHubOAuth(options: GitHubOAuthStartOptions = {}): void {
  window.location.assign(getGitHubOAuthStartUrl(options));
}
