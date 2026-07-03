import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "admin_session"

const ALLOWED_IPS = (process.env.ADMIN_ALLOWED_IPS ?? "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean)

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    ""
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block by IP before anything else
  if (ALLOWED_IPS.length > 0) {
    const ip = getClientIp(request)
    if (!ALLOWED_IPS.includes(ip)) {
      return new NextResponse(null, { status: 403 })
    }
  }

  // Login page is always accessible
  if (pathname === "/admin/login") return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token || !(await verifyToken(token))) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

// Inline — avoids any potential Edge Runtime import issues
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SECRET
    if (!secret) return false

    const lastDot = token.lastIndexOf(".")
    if (lastDot < 0) return false

    const payload = token.slice(0, lastDot)
    const sigEncoded = token.slice(lastDot + 1)

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    const base64 = sigEncoded.replaceAll("-", "+").replaceAll("_", "/")
    const padded = base64 + "==".slice((base64.length % 4) || 4)
    const sigBytes = Uint8Array.from(atob(padded), (c) => c.codePointAt(0) ?? 0)

    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload))
    if (!valid) return false

    const pb64 = payload.replaceAll("-", "+").replaceAll("_", "/")
    const pp = pb64 + "==".slice((pb64.length % 4) || 4)
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(pp), (c) => c.codePointAt(0) ?? 0)
    )
    const data = JSON.parse(decoded)
    return data.exp > Date.now()
  } catch {
    return false
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}
