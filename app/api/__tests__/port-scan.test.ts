// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import { NextRequest } from "next/server"

let mockBehavior: "connect" | "timeout" | "error" = "connect"

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

vi.mock("node:net", () => {
  const { EventEmitter } = require("node:events")

  class Socket extends EventEmitter {
    setTimeout() {
      // no-op
    }
    destroy() {
      // no-op
    }
    connect(_port: number, _host: string) {
      queueMicrotask(() => {
        if (mockBehavior === "connect") {
          this.emit("connect")
        } else if (mockBehavior === "timeout") {
          this.emit("timeout")
        } else {
          this.emit("error", new Error("connection refused"))
        }
      })
      return this
    }
  }

  return { Socket }
})

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/port-scan", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/port-scan", () => {
  afterEach(() => {
    mockBehavior = "connect"
  })

  it("reports open ports when the socket connects", async () => {
    mockBehavior = "connect"
    const { POST } = await import("@/app/api/port-scan/route")

    const response = await POST(makeRequest({ host: "example.com", ports: [80] }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.results).toContainEqual({ port: 80, isOpen: true, status: "open" })
  })

  it("reports closed ports on timeout", async () => {
    mockBehavior = "timeout"
    const { POST } = await import("@/app/api/port-scan/route")

    const response = await POST(makeRequest({ host: "example.com", ports: [81] }))
    const body = await response.json()

    expect(body.results).toContainEqual({ port: 81, isOpen: false, status: "closed" })
  })

  it("reports closed ports on socket error", async () => {
    mockBehavior = "error"
    const { POST } = await import("@/app/api/port-scan/route")

    const response = await POST(makeRequest({ host: "example.com", ports: [82] }))
    const body = await response.json()

    expect(body.results).toContainEqual({ port: 82, isOpen: false, status: "closed" })
  })

  it("returns 500 with a scan failed error for an invalid body", async () => {
    const { POST } = await import("@/app/api/port-scan/route")

    const response = await POST(makeRequest({ host: "example.com", ports: [99999] }))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ success: false, error: "Scan failed" })
  })
})
