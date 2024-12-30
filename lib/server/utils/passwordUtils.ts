// import "server-only";
import { pbkdf2Sync, randomBytes } from "crypto";

const options = {
  keyLength: 64,
  iterations: 600000,
};

export function hashPassword(password: string): string {
  const salt = getSalt();
  const hash = pbkdf2Sync(
    password,
    salt,
    options.iterations,
    options.keyLength,
    "sha512"
  ).toString("hex");
  return `${options.iterations}$${options.keyLength}$${hash}$${salt}`;
}

function getSalt(): string {
  return randomBytes(32).toString("hex");
}

export function verifyPassword(dbHash: string, password: string): boolean {
  const [iterations, hashLength, hash, salt] = dbHash.split("$");
  const passwordHash = pbkdf2Sync(
    password,
    salt,
    Number(iterations),
    Number(hashLength),
    "sha512"
  ).toString("hex");
  return passwordHash === hash;
}
