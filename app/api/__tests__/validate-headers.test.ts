// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { GET } from "@/app/api/validate-headers/route"

function makeRequest(query: string) {
  return new NextRequest(`http://localhost/api/validate-headers${query}`)
}

describe("GET /api/validate-headers", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns 400 when url is missing", async () => {
    const response = await GET(makeRequest(""))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: "URL is required" })
  })

  it("returns 400 for a non-http(s) protocol", async () => {
    const response = await GET(makeRequest("?url=ftp://example.com"))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: "Invalid protocol" })
  })

  it("returns only the allow-listed, title-cased security headers", async () => {
    const headerMap = new Map<string, string>([
      ["access-control-allow-origin", "*"],
      ["content-security-policy", "default-src 'self'"],
      ["x-powered-by", "Express"], // not allow-listed, should be excluded
    ])
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        headers: { get: (name: string) => headerMap.get(name) ?? null },
      })
    )

    const response = await GET(makeRequest("?url=https://example.com"))
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Content-Security-Policy": "default-src 'self'",
    })
    expect(body.headers["X-Powered-By"]).toBeUndefined()
  })

  it("returns 500 when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    const response = await GET(makeRequest("?url=https://example.com"))
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe("Failed to fetch headers")
  })
})
