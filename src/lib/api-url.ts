import { env } from "@/config/env";

/**
 * Builds the URL for API calls and browser redirects (e.g. OAuth).
 *
 * If `NEXT_PUBLIC_API_URL` is set, prepends it so requests go to a separate
 * backend host.
 * If it is empty, returns the path only so calls stay same-origin.
 */
export function resolveApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = env.apiUrl.replace(/\/$/, "");
  return base ? `${base}${p}` : p;
}
