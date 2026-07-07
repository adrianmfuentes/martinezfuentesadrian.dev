// @vitest-environment node
import { describe, it, expect, vi } from "vitest"

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
    remoteAddress = "93.184.216.34" // NOSONAR test fixture IP, not a real host
    setTimeout() {
      // no-op
    }
    destroy() {
      // no-op
    }
    connect(_port: number, _host: string, cb?: () => void) {
      queueMicrotask(() => cb?.())
      return this
    }
  }

  return { Socket }
})

vi.mock("node:tls", () => {
  const { EventEmitter } = require("node:events")

  class TLSSocket extends EventEmitter {
    destroy() {
      // no-op
    }
    getPeerCertificate() {
      return {
        subject: { CN: "example.com" },
        issuer: { CN: "Test CA" },
        valid_to: "Dec 31 23:59:59 2099 GMT",
        valid_from: "Jan 1 00:00:00 2020 GMT",
        ca: false,
        subjectaltname: "DNS:example.com, DNS:www.example.com",
      }
    }
  }

  return {
    connect: vi.fn(() => {
      const socket = new TLSSocket()
      queueMicrotask(() => socket.emit("secureConnect"))
      return socket
    }),
  }
})

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/certificate-check", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/certificate-check", () => {
  it("returns 400 when host is missing", async () => {
    const { POST } = await import("@/app/api/certificate-check/route")
    const response = await POST(makeRequest({ port: 443 }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: "Host is required and must be a string" })
  })

  it("returns 400 when host is not a string", async () => {
    const { POST } = await import("@/app/api/certificate-check/route")
    const response = await POST(makeRequest({ host: 123, port: 443 }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("Host is required and must be a string")
  })

  it("returns 400 when port is missing", async () => {
    const { POST } = await import("@/app/api/certificate-check/route")
    const response = await POST(makeRequest({ host: "example.com" }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: "Port must be a number between 1 and 65535" })
  })

  it("returns 400 when port is out of range", async () => {
    const { POST } = await import("@/app/api/certificate-check/route")
    const response = await POST(makeRequest({ host: "example.com", port: 70000 }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("Port must be a number between 1 and 65535")
  })

  it("returns 500 when the request body is malformed JSON", async () => {
    const { POST } = await import("@/app/api/certificate-check/route")
    const request = new Request("http://localhost/api/certificate-check", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    })
    const response = await POST(request)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.success).toBe(false)
  })

  it("returns certificate info on a successful TLS handshake", async () => {
    const { POST } = await import("@/app/api/certificate-check/route")
    const response = await POST(makeRequest({ host: "example.com", port: 443 }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.certificate).toMatchObject({
      subject: "example.com",
      issuer: "Test CA",
      isCA: false,
      isExpired: false,
      sans: ["example.com", "www.example.com"],
    })
  })
})
