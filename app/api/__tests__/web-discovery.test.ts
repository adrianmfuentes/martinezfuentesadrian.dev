// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("node:fs/promises", () => ({
  default: { readFile: vi.fn() },
}))

function makeRequest(query: string) {
  return new NextRequest(`http://localhost/api/web-discovery${query}`)
}

describe("GET /api/web-discovery", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("returns 400 when baseUrl is missing", async () => {
    const { GET } = await import("@/app/api/web-discovery/route")
    const response = await GET(makeRequest("?path=/"))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("baseUrl and path query params are required")
  })

  it("returns 400 when path is missing", async () => {
    const { GET } = await import("@/app/api/web-discovery/route")
    const response = await GET(makeRequest("?baseUrl=https://example.com"))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("baseUrl and path query params are required")
  })

  it("returns 500 when the wordlist cannot be read", async () => {
    const fs = (await import("node:fs/promises")).default as unknown as {
      readFile: ReturnType<typeof vi.fn>
    }
    fs.readFile.mockRejectedValue(new Error("ENOENT"))

    const { GET } = await import("@/app/api/web-discovery/route")
    const response = await GET(makeRequest("?baseUrl=https://example.com&path=/"))

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: "Error reading wordlist" })
  })

  it("probes derived URLs and returns matching results", async () => {
    const fs = (await import("node:fs/promises")).default as unknown as {
      readFile: ReturnType<typeof vi.fn>
    }
    fs.readFile.mockResolvedValue("admin\nlogin\n# comment\n")

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
      })
    )

    const { GET } = await import("@/app/api/web-discovery/route")
    const response = await GET(makeRequest("?baseUrl=https://example.com&path=/"))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.results)).toBe(true)
    expect(body.results.some((r: [string, number]) => r[0].includes("admin"))).toBe(true)
  }, 10000)
})
