import "server-only";
import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

/**
 * Back-office accounts.
 *
 * One account, configured through the environment:
 *   KORA_ADMIN_EMAIL           the login email
 *   KORA_ADMIN_PASSWORD_HASH   "scrypt$<salt b64>$<hash b64>", from `npm run hash-password`
 *
 * For a portfolio deployment, KORA_DEMO_LOGIN=true enables a published demo
 * account instead, so reviewers can explore the back office. It is ALWAYS on
 * in development and NEVER on in production unless explicitly enabled.
 */

export const DEMO_ACCOUNT = {
  email: "demo@kora-energy.example",
  password: "kora-demo-2024",
  name: "Demo reviewer",
};

export function demoLoginEnabled(): boolean {
  return process.env.KORA_DEMO_LOGIN === "true" || process.env.NODE_ENV !== "production";
}

async function verifyHash(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Returns the display name for valid credentials, or null. */
export async function checkCredentials(email: string, password: string): Promise<string | null> {
  const adminEmail = process.env.KORA_ADMIN_EMAIL?.toLowerCase();
  const adminHash = process.env.KORA_ADMIN_PASSWORD_HASH;

  if (adminEmail && adminHash && email === adminEmail) {
    return (await verifyHash(password, adminHash)) ? "Kora team" : null;
  }

  if (demoLoginEnabled() && email === DEMO_ACCOUNT.email) {
    return sameText(password, DEMO_ACCOUNT.password) ? DEMO_ACCOUNT.name : null;
  }

  return null;
}
