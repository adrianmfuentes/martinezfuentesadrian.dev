import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

// Supported locales
export const locales = ["en", "es"]
export const defaultLocale = "es"

// CORS configuration
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://martinezfuentesadrian.dev",
  "https://www.martinezfuentesadrian.dev"
]

// Get the preferred locale from the request
function getLocale(request: NextRequest) {
  const headers = new Headers(request.headers)
  const acceptLanguage = headers.get("accept-language") ?? ""

  // Create a negotiator instance with the headers
  const negotiatorHeaders = { "accept-language": acceptLanguage }
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  return match(languages, locales, defaultLocale)
}

// Handle CORS for API routes
function handleCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin")
  
  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  } else if (!origin) {
    // Same-origin requests
    response.headers.set("Access-Control-Allow-Origin", "*")
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Max-Age", "86400")

  return response
}

// Add security headers
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.emailjs.com https://vercel.live https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.emailjs.com https://vitals.vercel-insights.com https://vercel.live wss://ws-us3.pusher.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';")
  
  return response
}

export function middleware(request: NextRequest) {
  // Handle preflight requests for CORS
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 })
    const corsResponse = handleCors(request, response)
    return addSecurityHeaders(corsResponse)
  }

  // Handle API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next()
    const corsResponse = handleCors(request, response)
    return addSecurityHeaders(corsResponse)
  }

  // Get pathname from request
  const { pathname } = request.nextUrl

  // Check if pathname has a locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  // If pathname already has locale, apply security headers and continue
  if (pathnameHasLocale) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // Redirect if there is no locale in pathname
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  const response = NextResponse.redirect(request.nextUrl)
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files in public
    "/((?!_next|api|assets|fonts|images|cv|_vercel|.*\\.[^\\/]+$).*)",
    // Optional: only run on root (/) URL
    "/",
  ],
}
