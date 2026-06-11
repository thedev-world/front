import type { NextRequest } from "next/server";
import type { MeProfile } from "@/features/auth/types/me";

const SESSION_COOKIE_NAME = "thedevworld_session";

export async function getMeFromRequest(
  request: NextRequest,
): Promise<MeProfile | null> {
  const session = request.cookies.get(SESSION_COOKIE_NAME);
  if (!session) return null;

  try {
    // Proxy runs inside the Docker container — rewrites don't apply here,
    // so we must call the backend directly instead of going through thedev.world.
    const backendBase = process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
    const meUrl = `${backendBase}/api/v1/me`;

    const res = await fetch(meUrl, {
      headers: { cookie: `${session.name}=${session.value}` },
    });


    if (res.status === 401) return null;
    if (!res.ok) return null;

    const data = await res.json() as MeProfile;
    return data;
  } catch (err) {
    console.error("[get-me] fetch error:", err);
    return null;
  }
}
