import { resolveApiUrl } from "@/lib/api-url";

/** Must stay in sync with API `GITHUB_REAUTH_REQUIRED_DETAIL`. */
export const GITHUB_REAUTH_REQUIRED_DETAIL = "github_reauth_required";

export type GitHubOAuthStartOptions = {
  /** Absolute URL on an allowed frontend origin, e.g. https://thedev.world/profile */
  returnTo?: string;
  /** Force GitHub to show the consent screen again (needed for new org access). */
  promptConsent?: boolean;
};

export class GitHubReauthRequiredError extends Error {
  readonly status = 401;

  constructor(message = "GitHub organization access required") {
    super(message);
    this.name = "GitHubReauthRequiredError";
  }
}

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

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function redirectToGitHubOAuth(options: GitHubOAuthStartOptions = {}): void {
  window.location.assign(getGitHubOAuthStartUrl(options));
}

export async function readApiErrorDetail(res: Response): Promise<string | null> {
  try {
    const body: unknown = await res.clone().json();
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail?: unknown }).detail;
      if (typeof detail === "string") {
        return detail;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function assertOkOrThrowAuthError(res: Response): Promise<void> {
  if (res.ok) {
    return;
  }
  if (res.status === 401) {
    const detail = await readApiErrorDetail(res);
    if (detail === GITHUB_REAUTH_REQUIRED_DETAIL) {
      throw new GitHubReauthRequiredError();
    }
  }
}
