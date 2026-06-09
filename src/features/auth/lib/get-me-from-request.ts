import type { NextRequest } from "next/server";
import type { MeProfile } from "@/features/auth/types/me";

const SESSION_COOKIE_NAME = "devplanet_session";

export async function getMeFromRequest(
  request: NextRequest,
): Promise<MeProfile | null> {
  const session = request.cookies.get(SESSION_COOKIE_NAME);
  console.log("[get-me] session cookie present:", !!session);
  if (!session) return null;

  try {
    // Proxy runs inside the Docker container — rewrites don't apply here,
    // so we must call the backend directly instead of going through thedev.world.
    const backendBase = process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
    const meUrl = `${backendBase}/api/v1/me`;
    console.log("[get-me] fetching:", meUrl);

    const res = await fetch(meUrl, {
      headers: { cookie: `${session.name}=${session.value}` },
    });

    console.log("[get-me] response status:", res.status);

    if (res.status === 401) return null;
    if (!res.ok) return null;

    const data = await res.json() as MeProfile;
    console.log("[get-me] is_onboarded:", data.is_onboarded);
    return data;
  } catch (err) {
    console.error("[get-me] fetch error:", err);
    return null;
  }
}
