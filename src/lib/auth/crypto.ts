/**
 * Web Crypto API-based password hashing and HMAC-SHA256 session token management.
 * 100% compatible with Cloudflare Workers Edge runtime and Node.js.
 */

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  roles: ("MEMBER" | "ADMIN" | "SUPER_ADMIN" | "SUBSCRIPTION_MANAGER")[];
  voicePart?: string;
  tier?: string;
  exp: number; // Expiration timestamp in seconds
}

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  "thamar-shefah-choir-super-secure-auth-secret-key-2026-coptic-praise";

// Helper: Convert ArrayBuffer to Hex String
function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: Convert Hex String to Uint8Array
function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Helper: Base64Url encode
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Helper: Base64Url decode
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Hash a password using PBKDF2 with SHA-512 via Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-512",
    },
    keyMaterial,
    256 // 32 bytes
  );

  const saltHex = buf2hex(salt.buffer);
  const hashHex = buf2hex(derivedBits);

  return `${iterations}:${saltHex}:${hashHex}`;
}

/**
 * Verify a plain text password against a stored PBKDF2 hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;

    const iterations = parseInt(parts[0], 10);
    const salt = hex2buf(parts[1]);
    const expectedHashHex = parts[2];

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt as unknown as BufferSource,
        iterations: iterations,
        hash: "SHA-512",
      },
      keyMaterial,
      256
    );

    const derivedHex = buf2hex(derivedBits);

    // Constant time comparison
    if (derivedHex.length !== expectedHashHex.length) return false;
    let result = 0;
    for (let i = 0; i < derivedHex.length; i++) {
      result |= derivedHex.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

/**
 * Get or import the HMAC CryptoKey
 */
async function getHmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Create a signed, stateless session token using HMAC-SHA256
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadStr);

  const hmacKey = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(payloadB64)
  );

  const signatureB64 = base64UrlEncode(buf2hex(signatureBuffer));
  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verify a signed session token and return its payload if valid and not expired
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signatureB64] = parts;
    const hmacKey = await getHmacKey();

    const expectedHex = base64UrlDecode(signatureB64);
    const expectedSigBytes = hex2buf(expectedHex);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      hmacKey,
      expectedSigBytes as unknown as BufferSource,
      new TextEncoder().encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(payloadB64);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
