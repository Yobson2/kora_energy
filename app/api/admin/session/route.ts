import type { NextRequest } from "next/server";
import { loginSchema } from "@/app/lib/validation";
import { checkCredentials } from "@/app/server/auth/credentials";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/app/server/auth/session";
import {
  clientIp,
  crossOriginResponse,
  fail,
  internalError,
  ok,
  parseBody,
  rateLimit,
  rateLimitedResponse,
  sameOrigin,
} from "@/app/server/http";

/** POST /api/admin/session  sign in. DELETE  sign out. */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return crossOriginResponse();

  // Tight limit: this is the one endpoint worth brute-forcing.
  const limit = rateLimit(`login:${clientIp(request)}`, 8, 15 * 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfter);

  const parsed = await parseBody(request, loginSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const name = await checkCredentials(parsed.data.email, parsed.data.password);
    if (!name) {
      // One message for "no such account" and "wrong password", so the form
      // cannot be used to discover which emails have accounts.
      return fail(401, {
        code: "unauthorized",
        message: "That email and password do not match an account.",
      });
    }

    const token = await signSession({ sub: parsed.data.email, name, role: "admin" });
    const response = ok({ name });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    return internalError(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return crossOriginResponse();
  const response = ok({ signedOut: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
