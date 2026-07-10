// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// get-client-ip.ts imports "server-only", which throws when resolved outside
// of the "react-server" export condition. Vitest doesn't set that condition,
// so we stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({ get: () => null }),
}))

vi.mock("@/lib/ssrf-guard", () => ({
  isBlockedHost: vi.fn().mockResolvedValue(false),
}))

vi.mock("node:dns/promises", () => ({
  default: {
    resolve4: vi.fn().mockResolvedValue([]),
    resolve6: vi.fn().mockResolvedValue([]),
    resolveMx: vi.fn().mockResolvedValue([]),
    resolveTxt: vi.fn().mockResolvedValue([]),
    resolveNs: vi.fn().mockResolvedValue([]),
    resolveCname: vi.fn().mockResolvedValue([]),
  },
}))

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/dns-lookup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/dns-lookup", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("returns 400 when the host is blocked", async () => {
    const { isBlockedHost } = await import("@/lib/ssrf-guard")
    vi.mocked(isBlockedHost).mockResolvedValueOnce(true)

    const { POST } = await import("@/app/api/dns-lookup/route")
    const response = await POST(makeRequest({ domain: "169.254.169.254" }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ success: false, error: "Host not allowed" })
  })

  it("returns 500 with a lookup failed error when the domain is missing", async () => {
    const { POST } = await import("@/app/api/dns-lookup/route")
    const response = await POST(makeRequest({}))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ success: false, error: "Lookup failed" })
  })

  it("returns 500 when the request body is malformed JSON", async () => {
    const { POST } = await import("@/app/api/dns-lookup/route")
    const request = new NextRequest("http://localhost/api/dns-lookup", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    })
    const response = await POST(request)
    expect(response.status).toBe(500)
  })

  it("normalizes the domain, queries every record type, and returns the results", async () => {
    const dns = (await import("node:dns/promises")).default
    vi.mocked(dns.resolve4).mockResolvedValueOnce(["93.184.216.34"])
    vi.mocked(dns.resolveMx).mockResolvedValueOnce([{ exchange: "mail.example.com", priority: 10 }])
    vi.mocked(dns.resolveTxt).mockResolvedValueOnce([["v=spf1", " -all"]])

    const { POST } = await import("@/app/api/dns-lookup/route")
    const response = await POST(makeRequest({ domain: "  Example.COM  " }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.domain).toBe("example.com")
    expect(body.records.A).toEqual(["93.184.216.34"])
    expect(body.records.MX).toEqual([{ exchange: "mail.example.com", priority: 10 }])
    expect(body.records.TXT).toEqual(["v=spf1 -all"])
    expect(body.records.AAAA).toEqual([])
  })

  it("returns an empty list for a record type whose lookup fails, without failing the whole request", async () => {
    const dns = (await import("node:dns/promises")).default
    vi.mocked(dns.resolveNs).mockRejectedValueOnce(new Error("NXDOMAIN"))

    const { POST } = await import("@/app/api/dns-lookup/route")
    const response = await POST(makeRequest({ domain: "example.com" }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.records.NS).toEqual([])
  })

  it("returns 429 once the per-IP rate limit is exceeded", async () => {
    const { POST } = await import("@/app/api/dns-lookup/route")

    for (let i = 0; i < 20; i++) {
      const response = await POST(makeRequest({ domain: "example.com" }))
      expect(response.status).toBe(200)
    }

    const response = await POST(makeRequest({ domain: "example.com" }))
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body).toEqual({ success: false, error: "Too many requests. Please try again later." })
  })
})
