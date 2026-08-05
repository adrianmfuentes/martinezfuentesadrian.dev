import { NextRequest, NextResponse } from "next/server"
import { getClientIp } from "@/lib/get-client-ip"
import { rateLimit } from "@/lib/rate-limit"
import { incrementToolUsage } from "@/lib/kv"

// Client-only tools (no server round trip for their actual work) ping this
// endpoint to be counted on /tools/stats. Restricted to a known allowlist so
// this can't be used to write arbitrary keys into the Redis hash.
const CLIENT_ONLY_TOOL_IDS = new Set(["password-generator", "jwt-decoder", "hash-generator"])

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 30,
})

export async function POST(request: NextRequest) {
  const ip = await getClientIp()
  try {
    await limiter.check(ip)
  } catch {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  const { tool } = await request.json().catch(() => ({ tool: undefined }))

  if (typeof tool !== "string" || !CLIENT_ONLY_TOOL_IDS.has(tool)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  await incrementToolUsage(tool)
  return NextResponse.json({ ok: true })
}
