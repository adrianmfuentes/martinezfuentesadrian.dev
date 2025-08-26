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

export function middleware(request: NextRequest) {
  // Handle preflight requests for CORS
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 })
    return handleCors(request, response)
  }

  // Handle API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next()
    return handleCors(request, response)
  }

  // Get pathname from request
  const { pathname } = request.nextUrl

  // Check if pathname has a locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  // If pathname already has locale, don't redirect
  if (pathnameHasLocale) return NextResponse.next()

  // Redirect if there is no locale in pathname
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files in public
    "/((?!_next|api|assets|fonts|images|cv|_vercel|.*\\.[^\\/]+$).*)",
    // Optional: only run on root (/) URL
    "/",
  ],
}
