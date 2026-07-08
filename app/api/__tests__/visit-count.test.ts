// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"

// get-client-ip.ts imports "server-only", which throws when resolved outside
// of the "react-server" export condition. Vitest doesn't set that condition,
// so we stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({ get: () => "1.2.3.4" }),
}))

const incrementVisitCount = vi.fn()
vi.mock("@/lib/kv", () => ({ incrementVisitCount: () => incrementVisitCount() }))

describe("GET /api/visit-count", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns the incremented count", async () => {
    incrementVisitCount.mockResolvedValue(42)
    const { GET } = await import("@/app/api/visit-count/route")

    const response = await GET()
    const body = await response.json()

    expect(body).toEqual({ count: 42 })
  })

  it("returns a null count when Redis is not configured", async () => {
    incrementVisitCount.mockResolvedValue(null)
    const { GET } = await import("@/app/api/visit-count/route")

    const response = await GET()
    const body = await response.json()

    expect(body).toEqual({ count: null })
  })
})
