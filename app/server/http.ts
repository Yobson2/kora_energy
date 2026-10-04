import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { fieldErrors, type FieldErrors } from "@/app/lib/validation";
import { SESSION_COOKIE, verifySession, type Session } from "@/app/server/auth/session";
import { DEFAULT_LOCALE, type Locale } from "@/app/lib/i18n";

/**
 * The API's conventions, in one file:
 *
 *   success   2xx  { data: … }
 *   failure   4xx/5xx  { error: { code, message, fields? } }
 *
 * `code` is stable and machine-readable (clients branch on it); `message` is
 * written for a person and safe to show. Internal details never leave the
 * server  they go to the log with a request id the client can quote.
 */

export type ApiErrorCode =
  | "invalid_json"
  | "payload_too_large"
  | "validation_failed"
  | "unprocessable"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "internal";

export type ApiError = { code: ApiErrorCode; message: string; fields?: FieldErrors };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(status: number, error: ApiError, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

const MAX_BODY_BYTES = 32 * 1024;

/**
 * Messages a person may read: the public forms show them. Validation messages
 * come from the schema, which the route picks in the same language.
 */
const MESSAGES = {
  en: {
    tooLarge: "That request is too large.",
    unreadable: "The request body could not be read.",
    invalidJson: "The request body is not valid JSON.",
    validation: "Some fields need attention.",
    rateLimited: (minutes: number) => `Too many attempts. Try again in ${minutes} minute(s).`,
    internal: (id: string) =>
      `Something went wrong on our side. If it keeps happening, quote reference ${id}.`,
  },
  fr: {
    tooLarge: "Cette requête est trop volumineuse.",
    unreadable: "Le contenu de la requête n'a pas pu être lu.",
    invalidJson: "Le contenu de la requête n'est pas du JSON valide.",
    validation: "Certains champs sont à vérifier.",
    rateLimited: (minutes: number) =>
      `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
    internal: (id: string) =>
      `Un problème est survenu de notre côté. S'il persiste, indiquez la référence ${id}.`,
  },
} satisfies Record<Locale, unknown>;

/**
 * The language a client asked for. The site's own forms send the page
 * language as Accept-Language; other clients get standard negotiation, with
 * English as the default.
 */
export function requestLocale(request: Request): Locale {
  return /^\s*fr\b/i.test(request.headers.get("accept-language") ?? "") ? "fr" : DEFAULT_LOCALE;
}

/**
 * Reads and validates a JSON body. Returns either the parsed data or a ready
 * error response  the caller cannot forget to handle one of them.
 */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S
): Promise<{ data: z.infer<S> } | { response: NextResponse }> {
  const locale = requestLocale(request);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return {
      response: fail(413, { code: "payload_too_large", message: MESSAGES[locale].tooLarge }),
    };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return {
      response: fail(400, { code: "invalid_json", message: MESSAGES[locale].unreadable }),
    };
  }
  // content-length can be absent or wrong; check what actually arrived.
  if (raw.length > MAX_BODY_BYTES) {
    return {
      response: fail(413, { code: "payload_too_large", message: MESSAGES[locale].tooLarge }),
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return {
      response: fail(400, { code: "invalid_json", message: MESSAGES[locale].invalidJson }),
    };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      response: fail(422, {
        code: "validation_failed",
        message: MESSAGES[locale].validation,
        fields: fieldErrors(result.error),
      }),
    };
  }
  return { data: result.data };
}

/**
 * Rejects cross-site state changes. Browsers always send Origin on POST/PATCH/
 * DELETE; a mismatch means another site is trying to make the visitor's
 * browser act for it. SameSite=Lax cookies already block most of this  this
 * is the second lock on the same door.
 */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export function crossOriginResponse() {
  return fail(403, { code: "forbidden", message: "Cross-site requests are not accepted." });
}

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/* ── rate limiting ──────────────────────────────────────────────────────── */

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();

/**
 * Fixed-window limiter, in process memory. Correct for a single instance and
 * good enough to stop a script hammering a form. A multi-instance deployment
 * swaps this for Redis/Upstash behind the same signature.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    if (windows.size > 10_000) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
    }
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  return {
    allowed: current.count <= limit,
    retryAfter: Math.ceil((current.resetAt - now) / 1000),
  };
}

export function rateLimitedResponse(retryAfter: number, locale: Locale = DEFAULT_LOCALE) {
  return fail(
    429,
    {
      code: "rate_limited",
      message: MESSAGES[locale].rateLimited(Math.max(1, Math.ceil(retryAfter / 60))),
    },
    { "Retry-After": String(retryAfter) }
  );
}

/* ── auth ───────────────────────────────────────────────────────────────── */

/** Second gate for admin API routes (proxy.ts is the first). */
export async function requireAdmin(
  request: NextRequest
): Promise<{ session: Session } | { response: NextResponse }> {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return { response: fail(401, { code: "unauthorized", message: "Sign in to continue." }) };
  }
  if (request.method !== "GET" && request.method !== "HEAD" && !sameOrigin(request)) {
    return { response: crossOriginResponse() };
  }
  return { session };
}

export function internalError(error: unknown, locale: Locale = DEFAULT_LOCALE) {
  const id = crypto.randomUUID().slice(0, 8);
  console.error(`[api] ${id}`, error);
  return fail(500, {
    code: "internal",
    message: MESSAGES[locale].internal(id),
  });
}
