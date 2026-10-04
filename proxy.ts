import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/app/server/auth/session";
import { DEFAULT_LOCALE } from "@/app/lib/i18n";

/**
 * Two jobs, split by path.
 *
 * Back office: the first gate. Unauthenticated page requests are redirected
 * to sign-in (keeping where they were going); API requests get a 401 JSON
 * error rather than an HTML redirect a client cannot use. Every admin page and
 * route checks the session AGAIN itself  this is an optimisation and a
 * convenience, not the security boundary.
 *
 * Public pages: language routing. English keeps the unprefixed addresses and
 * is served from app/[lang] by an internal rewrite to "/en/…"; French is
 * addressed as "/fr/…" directly. "/en/…" typed by hand redirects to the clean
 * address, so each page has exactly one URL per language.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    return guardAdmin(request);
  }

  if (pathname === "/fr" || pathname.startsWith("/fr/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

async function guardAdmin(request: NextRequest) {
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
  matcher: [
    // /api/admin/session is the sign-in endpoint itself and must stay reachable.
    "/admin/:path*",
    "/api/admin/((?!session).*)",
    // Public pages: everything except the API, the back office, Next's own
    // assets, the generated social card and files with an extension
    // (icon.svg, robots.txt, sitemap.xml, /media/*).
    "/((?!api/|admin|_next/|opengraph-image|.*\\.).*)",
  ],
};
