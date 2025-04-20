// src/lib/encryption.ts
import CryptoJS from "crypto-js";

export interface EncryptedPayload {
  iv: string;         // hex
  ciphertext: string; // base64
}

// your 32‑byte key in .env.local as VITE_ENCRYPTION_KEY
const RAW_KEY = import.meta.env.VITE_ENCRYPTION_KEY!;
const KEY = CryptoJS.enc.Utf8.parse(RAW_KEY);

/** AES‑CBC encrypt any JSON‑serializable object under the static key */
export function encryptPayload<T>(payload: T): EncryptedPayload {
  const ivWA = CryptoJS.lib.WordArray.random(128 / 8);
  const ivHex = ivWA.toString();
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    KEY,
    { iv: ivWA }
  ).toString();
  return { iv: ivHex, ciphertext };
}

/** Decrypt back into your original object */
export function decryptPayload<T>(pkg: EncryptedPayload): T {
  const ivWA = CryptoJS.enc.Hex.parse(pkg.iv);
  const bytes = CryptoJS.AES.decrypt(pkg.ciphertext, KEY, { iv: ivWA });
  const json = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(json) as T;
}
