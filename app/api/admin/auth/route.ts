import { NextResponse } from "next/server"
import { createSessionToken, verifyAdminPassword, ADMIN_COOKIE } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
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
      path: "/admin",
      maxAge: 8 * 60 * 60,
    })

    return response
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
