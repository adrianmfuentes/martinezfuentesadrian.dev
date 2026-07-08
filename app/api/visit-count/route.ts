import { NextResponse } from "next/server"
import { incrementVisitCount } from "@/lib/kv"
import { getClientIp } from "@/lib/get-client-ip"
import { rateLimit } from "@/lib/rate-limit"

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 20,
})

export async function GET() {
  try {
    const ip = await getClientIp()
    try {
      await limiter.check(ip)
    } catch {
      return NextResponse.json({ count: null }, { status: 429 })
    }

    const count = await incrementVisitCount()
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: null }, { status: 500 })
  }
}
