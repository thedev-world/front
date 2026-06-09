import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getMeFromRequest } from "@/features/auth/lib/get-me-from-request";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[proxy] pathname:", pathname);

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const me = await getMeFromRequest(request);
  console.log("[proxy] me:", me ? `id=${me.is_onboarded}` : "null");

  if (!me && pathname === "/onboarding") {
    console.log("[proxy] redirect → /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (me && !me.is_onboarded && pathname !== "/onboarding") {
    console.log("[proxy] redirect → /onboarding");
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (me?.is_onboarded && pathname === "/onboarding") {
    console.log("[proxy] redirect → /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|images/).*)"],
};
