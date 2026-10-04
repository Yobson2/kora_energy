import type { FieldErrors } from "@/app/lib/validation";
import { DEFAULT_LOCALE, type Locale } from "@/app/lib/i18n";

/**
 * Browser-side caller for the JSON API. Always resolves  never throws  to a
 * discriminated result, so every form handles network failure, validation
 * failure and success as three explicit branches.
 */

export type ApiFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  fields?: FieldErrors;
};

export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

const MESSAGES: Record<Locale, { network: string; unknown: string }> = {
  en: {
    network:
      "We couldn't reach the server. Check your connection and try again. Nothing you entered has been lost.",
    unknown: "Something went wrong on our side. Try again in a moment.",
  },
  fr: {
    network:
      "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez. Rien de ce que vous avez saisi n'est perdu.",
    unknown: "Un problème est survenu de notre côté. Réessayez dans un instant.",
  },
};

export async function apiRequest<T>(
  url: string,
  init: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
    /** The page language: the server answers in it, and so do the fallbacks here. */
    locale?: Locale;
  } = {}
): Promise<ApiResult<T>> {
  const locale = init.locale ?? DEFAULT_LOCALE;
  const headers: Record<string, string> = { "Accept-Language": locale };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method ?? "POST",
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
      credentials: "same-origin",
    });
  } catch {
    return { ok: false, status: 0, code: "network", message: MESSAGES[locale].network };
  }

  let json: { data?: T; error?: { code: string; message: string; fields?: FieldErrors } } | null =
    null;
  try {
    json = await response.json();
  } catch {
    // A proxy error page or an empty body  fall through to a generic failure.
  }

  if (response.ok && json && "data" in json) return { ok: true, data: json.data as T };

  return {
    ok: false,
    status: response.status,
    code: json?.error?.code ?? "unknown",
    message: json?.error?.message ?? MESSAGES[locale].unknown,
    fields: json?.error?.fields,
  };
}
