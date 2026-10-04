import type { FieldErrors } from "@/app/lib/validation";

/**
 * Browser-side caller for the JSON API. Always resolves — never throws — to a
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

const NETWORK_FAILURE: ApiFailure = {
  ok: false,
  status: 0,
  code: "network",
  message:
    "We couldn't reach the server. Check your connection and try again — nothing you entered has been lost.",
};

export async function apiRequest<T>(
  url: string,
  init: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; signal?: AbortSignal } = {}
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method ?? "POST",
      headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
      credentials: "same-origin",
    });
  } catch {
    return NETWORK_FAILURE;
  }

  let json: { data?: T; error?: { code: string; message: string; fields?: FieldErrors } } | null =
    null;
  try {
    json = await response.json();
  } catch {
    // A proxy error page or an empty body — fall through to a generic failure.
  }

  if (response.ok && json && "data" in json) return { ok: true, data: json.data as T };

  return {
    ok: false,
    status: response.status,
    code: json?.error?.code ?? "unknown",
    message: json?.error?.message ?? "Something went wrong on our side. Try again in a moment.",
    fields: json?.error?.fields,
  };
}
