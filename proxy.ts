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

// Per-request nonce for script-src so inline scripts (React/Next's own
// streaming bootstrap scripts, our JSON-LD tags) can run under a CSP that
// no longer needs a blanket 'unsafe-inline'. 'unsafe-inline' is still listed
// as a fallback for browsers that predate CSP3 nonce support — per spec,
// any browser that understands 'nonce-*' ignores 'unsafe-inline' outright,
// so this is a pure upgrade for modern browsers, not a relaxed policy.
function buildCsp(nonce: string): string {
  // Only widen the policy for optional integrations once they're actually
  // configured (see README's "Optional integrations" section) — no change
  // to the default CSP otherwise.
  const giscusEnabled = Boolean(process.env.NEXT_PUBLIC_GISCUS_REPO)
  const sentryIngestHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_SENTRY_DSN ?? "").host
    } catch {
      return null
    }
  })()

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://cdn.emailjs.com${giscusEnabled ? " https://giscus.app" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    (() => {
      const sentryConnect = sentryIngestHost ? ` https://${sentryIngestHost}` : ""
      return `connect-src 'self' https://api.emailjs.com${giscusEnabled ? " https://giscus.app" : ""}${sentryConnect}`
    })(),
    `frame-src ${giscusEnabled ? "https://giscus.app" : "'none'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const csp = buildCsp(nonce)

  if (pathname.startsWith("/admin")) {
    // Block by IP before anything else
    if (ALLOWED_IPS.length > 0) {
      const ip = getClientIp(request)
      if (!ALLOWED_IPS.includes(ip)) {
        const response = new NextResponse(null, { status: 403 })
        response.headers.set("Content-Security-Policy", csp)
        return response
      }
    }

    // Login page is always accessible
    if (pathname === "/admin/login") {
      const response = NextResponse.next()
      response.headers.set("Content-Security-Policy", csp)
      return response
    }

    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token || !(await verifyToken(token))) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.headers.set("Content-Security-Policy", csp)
      return response
    }

    const response = NextResponse.next()
    response.headers.set("Content-Security-Policy", csp)
    return response
  }

  // Forward the active locale so the root layout can render the correct
  // <html lang> without every page needing its own metadata export.
  const locale = pathname.startsWith("/en") ? "en" : "es"
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-locale", locale)
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("Content-Security-Policy", csp)
  return response
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
  matcher: ["/admin/:path*", "/((?!api|_next|.*\\..*).*)"],
}
