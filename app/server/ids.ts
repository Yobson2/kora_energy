import "server-only";
import { randomBytes, randomUUID } from "node:crypto";

// Crockford-style alphabet: no I, L, O or U, so a reference read aloud over a
// bad phone line cannot be mistaken for a different one.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function newId(): string {
  return randomUUID();
}

/** "KE-2610-4F7Q": prefix, year+month, 4 random characters (~1M per month). */
export function newReference(now = new Date()): string {
  const yymm = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const random = Array.from(randomBytes(4), (b) => ALPHABET[b % 32]).join("");
  return `KE-${yymm}-${random}`;
}
