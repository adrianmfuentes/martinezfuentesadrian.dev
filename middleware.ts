import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

// Supported locales
export const locales = ["en", "es"]
export const defaultLocale = "es"

// Get the preferred locale from the request
function getLocale(request: NextRequest) {
  const headers = new Headers(request.headers)
  const acceptLanguage = headers.get("accept-language") || ""

  // Create a negotiator instance with the headers
  const negotiatorHeaders = { "accept-language": acceptLanguage }
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
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
    // Skip all internal paths (_next)
    "/((?!_next|api|assets|fonts|images|_vercel).*)",
    // Optional: only run on root (/) URL
    "/",
  ],
}
