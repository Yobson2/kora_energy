// Prints a KORA_ADMIN_PASSWORD_HASH value for the back-office account.
// Usage: npm run hash-password -- "a long passphrase"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run hash-password -- "a passphrase of at least 12 characters"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`scrypt$${salt.toString("base64")}$${hash.toString("base64")}`);
