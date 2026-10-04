/**
 * Signed session tokens for the back office.
 *
 * Deliberately dependency-free and built on Web Crypto, so the SAME code
 * verifies a session in proxy.ts (the first gate) and in every admin route
 * and page (the second gate). Proxy alone is never trusted: a matcher typo
 * would otherwise expose the API.
 *
 * Token: base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload)).
 * Stateless — revocation is by rotating KORA_SESSION_SECRET. A multi-user
 * deployment would add a session table; the cookie format would not change.
 */

export const SESSION_COOKIE = "kora_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // one working day

export type Session = {
  sub: string;
  name: string;
  role: "admin";
  exp: number;
};

const encoder = new TextEncoder();
const DEV_SECRET = "kora-dev-only-secret-do-not-use-in-production-0001";

function secret(): string {
  const configured = process.env.KORA_SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV === "production") {
    // Fail closed: a guessable default secret in production would let anyone
    // mint an admin session.
    throw new Error("KORA_SESSION_SECRET must be set (32+ characters) in production.");
  }
  return DEV_SECRET;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(session: Omit<Session, "exp">): Promise<string> {
  const payload: Session = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the session, or null for anything missing, tampered with or expired. */
export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    // crypto.subtle.verify is constant-time with respect to the signature.
    const valid = await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromBase64Url(signature),
      encoder.encode(body)
    );
    if (!valid) return null;

    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Session;
    if (typeof session.exp !== "number" || session.exp * 1000 < Date.now()) return null;
    return session;
  } catch {
    // Malformed base64 or JSON is simply an invalid token.
    return null;
  }
}
