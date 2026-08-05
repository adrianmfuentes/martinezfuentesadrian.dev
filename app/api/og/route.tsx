import { ImageResponse } from "next/og"
import { NextResponse, type NextRequest } from "next/server"
import { getClientIp } from "@/lib/get-client-ip"
import { rateLimit } from "@/lib/rate-limit"

const SITE_NAME = "Adrián Martínez Fuentes"
const SITE_HOST = "amf.amfserver.duckdns.org"

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 60,
})

function clamp(value: string | null, max: number): string {
  if (!value) return ""
  return value.slice(0, max)
}

export async function GET(request: NextRequest) {
  const ip = await getClientIp()
  try {
    await limiter.check(ip)
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const title = clamp(searchParams.get("title"), 120) || SITE_NAME
  const subtitle = clamp(searchParams.get("subtitle"), 160)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#020617",
          backgroundImage:
            "radial-gradient(circle at 20% 15%, rgba(34,197,94,0.28), transparent 55%), radial-gradient(circle at 85% 90%, rgba(34,197,94,0.14), transparent 45%)",
          padding: "72px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#4ade80",
            }}
          />
          <span style={{ color: "#4ade80", fontSize: 28, letterSpacing: 2 }}>{SITE_HOST}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              color: "#f8fafc",
              lineHeight: 1.15,
              fontWeight: 700,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", fontSize: 28, color: "#94a3b8", maxWidth: 900 }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", color: "#4ade80", fontSize: 24 }}>{SITE_NAME}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
