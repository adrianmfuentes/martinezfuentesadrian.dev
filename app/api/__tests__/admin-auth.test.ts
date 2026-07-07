// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"

// get-client-ip.ts imports "server-only", which throws when resolved outside
// of the "react-server" export condition. Vitest doesn't set that condition,
// so we stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

vi.mock("@/lib/admin-auth", () => ({
  ADMIN_COOKIE: "admin_session",
  verifyAdminPassword: vi.fn(),
  createSessionToken: vi.fn(),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({ get: () => null }),
}))

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/auth", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/admin/auth", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when the password is invalid", async () => {
    const { POST } = await import("@/app/api/admin/auth/route")
    const { verifyAdminPassword } = await import("@/lib/admin-auth")
    vi.mocked(verifyAdminPassword).mockReturnValue(false)

    const response = await POST(makeRequest({ password: "wrong" }))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: "Invalid password" })
  })

  it("returns 200 and sets the session cookie when the password is valid", async () => {
    const { POST } = await import("@/app/api/admin/auth/route")
    const { verifyAdminPassword, createSessionToken } = await import("@/lib/admin-auth")
    vi.mocked(verifyAdminPassword).mockReturnValue(true)
    vi.mocked(createSessionToken).mockResolvedValue("token-abc")

    const response = await POST(makeRequest({ password: "correct" }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ ok: true })

    const cookie = response.cookies.get("admin_session")
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe("token-abc")
  })

  it("returns 500 when the request body is malformed JSON", async () => {
    const { POST } = await import("@/app/api/admin/auth/route")
    const request = new Request("http://localhost/api/admin/auth", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ error: "Internal error" })
  })
})
