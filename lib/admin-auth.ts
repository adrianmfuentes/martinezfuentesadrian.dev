// Edge Runtime compatible — uses only Web Crypto API (no Node.js modules)

export const ADMIN_COOKIE = "admin_session"
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours

const enc = new TextEncoder()
const dec = new TextDecoder()

function b64uEncode(input: string): string {
  return btoa(input).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

function b64uEncodeBytes(bytes: Uint8Array): string {
  return btoa(String.fromCodePoint(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

function b64uDecodeBytes(input: string): Uint8Array {
  const base64 = input.replaceAll("-", "+").replaceAll("_", "/")
  const padded = base64 + "==".slice((base64.length % 4) || 4)
  return Uint8Array.from(atob(padded), (c) => c.codePointAt(0) ?? 0)
}

function b64uDecodeString(input: string): string {
  return dec.decode(b64uDecodeBytes(input))
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw new Error("ADMIN_SECRET is not configured")

  const payload = b64uEncode(
    JSON.stringify({ iat: Date.now(), exp: Date.now() + SESSION_DURATION_MS })
  )

  const key = await getHmacKey(secret)
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload))
  const sigEncoded = b64uEncodeBytes(new Uint8Array(sig))

  return `${payload}.${sigEncoded}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SECRET
    if (!secret) return false

    const lastDot = token.lastIndexOf(".")
    if (lastDot < 0) return false

    const payload = token.slice(0, lastDot)
    const sigEncoded = token.slice(lastDot + 1)

    const key = await getHmacKey(secret)
    const sigBytes = b64uDecodeBytes(sigEncoded)
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes as BufferSource, enc.encode(payload))
    if (!valid) return false

    const data = JSON.parse(b64uDecodeString(payload))
    return data.exp > Date.now()
  } catch {
    return false
  }
}

export function verifyAdminPassword(input: string): boolean {
  const stored = process.env.ADMIN_PASSWORD
  if (!stored) return false

  const a = enc.encode(input)
  const b = enc.encode(stored)
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}
