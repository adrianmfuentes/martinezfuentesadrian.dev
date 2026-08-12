import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
