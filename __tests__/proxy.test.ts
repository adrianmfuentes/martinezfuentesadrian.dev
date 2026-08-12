// @vitest-environment node
import { describe, it, expect } from "vitest"
import { NextRequest } from "next/server"
import { proxy } from "@/proxy"

function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`)
}

describe("proxy", () => {
  it("passes requests through", async () => {
    const response = await proxy(makeRequest("/en/about"))
    expect(response.status).toBe(200)
  })

  it("sets a Content-Security-Policy header with a per-request nonce", async () => {
    const response = await proxy(makeRequest("/es"))
    const csp = response.headers.get("Content-Security-Policy")
    expect(csp).toContain("default-src 'self'")
    expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/)
  })
})
