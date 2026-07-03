// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import { POST } from "@/app/api/check-password/route"

async function sha1Hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/check-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/check-password", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns 400 when password is missing", async () => {
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: "Password is required" })
  })

  it("returns the count when the hash suffix is found in the range response", async () => {
    const password = "correct horse battery staple"
    const fullHash = await sha1Hex(password)
    const suffix = fullHash.slice(5)

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `AAAA0:1\r\n${suffix}:42\r\nBBBB1:7`,
    })
    vi.stubGlobal("fetch", fetchMock)

    const response = await POST(makeRequest({ password }))
    const body = await response.json()

    expect(body).toEqual({ count: 42 })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://api.pwnedpasswords.com/range/"),
      expect.any(Object)
    )
  })

  it("returns count 0 when the hash suffix is not found", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "AAAA0:1\r\nBBBB1:7",
    })
    vi.stubGlobal("fetch", fetchMock)

    const response = await POST(makeRequest({ password: "some-unique-password" }))
    const body = await response.json()

    expect(body).toEqual({ count: 0 })
  })

  it("returns 500 when the fetch response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    const response = await POST(makeRequest({ password: "whatever" }))
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ error: "Failed to check password" })
  })
})
