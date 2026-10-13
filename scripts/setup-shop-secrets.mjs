import { pbkdf2Sync, randomBytes } from "node:crypto";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const password = Buffer.concat(chunks).toString("utf8").replace(/[\r\n]+$/, "");
if (password.length < 14) {
  console.error("Use an admin password with at least 14 characters.");
  process.exit(1);
}
const iterations = 310000;
const salt = randomBytes(24);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const encode = (value) => value.toString("base64url");
console.log(`ADMIN_PASSWORD_HASH=pbkdf2-sha256$${iterations}$${encode(salt)}$${encode(hash)}`);
console.log(`ADMIN_SESSION_SECRET=${encode(randomBytes(48))}`);
