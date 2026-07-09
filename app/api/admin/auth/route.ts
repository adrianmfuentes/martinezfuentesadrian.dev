import { NextResponse } from "next/server"
import { createSessionToken, verifyAdminPassword, ADMIN_COOKIE } from "@/lib/admin-auth"
import { getClientIp } from "@/lib/get-client-ip"
import { rateLimit } from "@/lib/rate-limit"

// Throttles login attempts per IP to make online brute-forcing the admin password impractical.
const limiter = rateLimit({
  interval: 15 * 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 5,
})

export async function POST(request: Request) {
  try {
    const ip = await getClientIp()
    try {
      await limiter.check(ip)
    } catch {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
    }

    const { password } = await request.json()

    if (!verifyAdminPassword(password ?? "")) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const token = await createSessionToken()

    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    })

    return response
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
