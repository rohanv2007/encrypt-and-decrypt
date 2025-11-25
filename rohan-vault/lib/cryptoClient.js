// lib/cryptoClient.js
// Client-side utilities: deriveKey (PBKDF2) and AES-GCM encrypt/decrypt.
// All functions use Web Crypto API and return ArrayBuffers / Blobs.

const enc = new TextEncoder();
const dec = new TextDecoder();

export async function deriveKeyFromPassword(password, salt, iterations = 200_000) {
  // password: string, salt: Uint8Array
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function randomBytes(length) {
  const b = new Uint8Array(length);
  crypto.getRandomValues(b);
  return b;
}

export async function encryptFileWithPassword(file, password) {
  // returns a Blob which contains: [salt(16)] [iv(12)] [ciphertext]
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKeyFromPassword(password, salt);

  const arrayBuffer = await file.arrayBuffer();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    arrayBuffer
  );

  // build output: salt + iv + ciphertext
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

  return new Blob([combined], { type: "application/octet-stream" });
}

export async function decryptBlobWithPassword(blob, password) {
  // blob contains salt(16) + iv(12) + ciphertext
  const buf = await blob.arrayBuffer();
  const u = new Uint8Array(buf);

  const salt = u.slice(0, 16);
  const iv = u.slice(16, 28);
  const ciphertext = u.slice(28);

  const key = await deriveKeyFromPassword(password, salt);
  let plaintext;
  try {
    plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  } catch (e) {
    throw new Error("Decryption failed — wrong password or file corrupted.");
  }

  return new Blob([plaintext]); // Blob of original file bytes
}
