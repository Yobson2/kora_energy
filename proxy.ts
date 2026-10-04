import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/app/server/auth/session";

/**
 * First gate in front of the back office. Unauthenticated page requests are
 * redirected to sign-in (keeping where they were going); API requests get a
 * 401 JSON error rather than an HTML redirect a client cannot use.
 *
 * Every admin page and route checks the session AGAIN itself — this file is
 * an optimisation and a convenience, not the security boundary.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to continue." } },
      { status: 401 }
    );
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  // /api/admin/session is the sign-in endpoint itself and must stay reachable.
  matcher: ["/admin/:path*", "/api/admin/((?!session).*)"],
};
