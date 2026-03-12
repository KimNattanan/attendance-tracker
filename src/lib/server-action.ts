"use server"

import crypto from "crypto";

export type ServerActionResult<T = void> =
  T extends void
    ? { success: true } | { success: false; error: string }
    : { success: true; data: T } | { success: false; error: string };

// encryption

const ALGO = "aes-256-gcm";

const KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_SECRET!)
  .digest();

export async function encryptString(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export async function decryptString(payload: string) {
  const data = Buffer.from(payload, "base64");
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}