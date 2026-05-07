import { env } from "@/config/env";
import { resolveApiUrl } from "@/lib/api-url";

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

type ApiFetchExtras = {
  broadcastUnauthorized?: boolean;
  passThrough401?: boolean;
};

export type ApiFetchOptions = RequestInit & ApiFetchExtras;

let unauthorizedBroadcastHandler: null | (() => Promise<void>) = null;

export function setUnauthorizedBroadcastHandler(
  handler: null | (() => Promise<void>),
): void {
  unauthorizedBroadcastHandler = handler;
}

export async function apiFetch(
  path: string,
  init: ApiFetchOptions = {},
): Promise<Response> {
  const {
    broadcastUnauthorized = false,
    passThrough401 = false,
    ...rest
  } = init;
  const url = resolveApiUrl(path);
  const res = await fetch(url, {
    ...rest,
    credentials: "include",
  });

  if (passThrough401) {
    return res;
  }

  if (res.status === 401) {
    if (broadcastUnauthorized) {
      void unauthorizedBroadcastHandler?.();
    }
    throw new UnauthorizedError();
  }

  return res;
}

export function getApiBaseUrl(): string {
  return env.apiUrl.replace(/\/$/, "");
}
