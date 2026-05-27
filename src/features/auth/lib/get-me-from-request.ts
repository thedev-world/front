import type { NextRequest } from "next/server";
import type { MeProfile } from "@/features/auth/types/me";

const SESSION_COOKIE_NAME = "devplanet_session";

export async function getMeFromRequest(
  request: NextRequest,
): Promise<MeProfile | null> {
  const session = request.cookies.get(SESSION_COOKIE_NAME);
  if (!session) return null;

  try {
    const meUrl = new URL("/api/v1/me", request.url);
    const res = await fetch(meUrl, {
      headers: { cookie: `${session.name}=${session.value}` },
    });

    if (res.status === 401) return null;
    if (!res.ok) return null;

    return res.json() as Promise<MeProfile>;
  } catch {
    return null;
  }
}
